const canvas = document.getElementById("game")
const ctx = canvas.getContext("2d")

let grid=40
let cols=22
let rows=12

let money=300
let health=20
let wave=1

let towers=[]
let enemies=[]
let bullets=[]

let selectedTower=null
let waveActive=false

const towerStats={
rod:{cost:100,range:3,rate:40,damage:10},
rapid:{cost:150,range:3,rate:15,damage:6},
farm:{cost:200},
support:{cost:180}
}

const maps={
river:[
{x:0,y:5},{x:5,y:5},{x:5,y:9},{x:14,y:9},{x:14,y:3},{x:21,y:3}
],

swamp:[
{x:0,y:8},{x:6,y:8},{x:6,y:2},{x:14,y:2},{x:14,y:9},{x:21,y:9}
]
}

let path=maps.river

canvas.addEventListener("click",e=>{

if(!selectedTower) return

const rect=canvas.getBoundingClientRect()

let x=Math.floor((e.clientX-rect.left)/grid)
let y=Math.floor((e.clientY-rect.top)/grid)

let cost=towerStats[selectedTower].cost

if(money<cost) return

towers.push({
x,y,
type:selectedTower,
cool:0,
tier:0
})

money-=cost
updateUI()

})

function selectTower(type){
selectedTower=type
}

function startNextWave(){

if(waveActive) return

waveActive=true

for(let i=0;i<wave*3;i++){

setTimeout(()=>{
spawnEnemy()
},i*500)

}

}

function spawnEnemy(){

enemies.push({
x:path[0].x,
y:path[0].y,
hp:40+wave*15,
speed:0.02+wave*0.002,
step:0
})

}

function update(){

for(let e of enemies){

let target=path[e.step+1]

if(!target){
health--
e.dead=true
continue
}

let dx=target.x-e.x
let dy=target.y-e.y

e.x+=dx*e.speed
e.y+=dy*e.speed

if(Math.abs(dx)<0.1 && Math.abs(dy)<0.1){
e.step++
}

}

for(let t of towers){

t.cool--

if(t.cool>0) continue

if(!towerStats[t.type].range) continue

for(let e of enemies){

let dx=e.x-t.x
let dy=e.y-t.y

let dist=Math.sqrt(dx*dx+dy*dy)

if(dist<towerStats[t.type].range){

bullets.push({
x:t.x,
y:t.y,
target:e,
dmg:towerStats[t.type].damage
})

t.cool=towerStats[t.type].rate
break

}

}

}

for(let b of bullets){

let dx=b.target.x-b.x
let dy=b.target.y-b.y

let dist=Math.sqrt(dx*dx+dy*dy)

b.x+=dx/dist*0.3
b.y+=dy/dist*0.3

if(dist<0.2){

b.target.hp-=b.dmg
b.dead=true

}

}

bullets=bullets.filter(b=>!b.dead)

enemies=enemies.filter(e=>{

if(e.hp<=0){

money+=5
return false

}

return !e.dead

})

if(enemies.length==0 && waveActive){

wave++
money+=50+wave
waveActive=false

updateUI()

}

if(health<=0){
gameOver()
}

}

function draw(){

ctx.clearRect(0,0,canvas.width,canvas.height)

ctx.strokeStyle="#444"

for(let x=0;x<cols;x++){
for(let y=0;y<rows;y++){

ctx.strokeRect(x*grid,y*grid,grid,grid)

}
}

ctx.strokeStyle="yellow"
ctx.lineWidth=6

ctx.beginPath()

for(let i=0;i<path.length;i++){

let p=path[i]

let px=p.x*grid+grid/2
let py=p.y*grid+grid/2

if(i==0) ctx.moveTo(px,py)
else ctx.lineTo(px,py)

}

ctx.stroke()

for(let t of towers){

ctx.fillStyle="blue"

ctx.fillRect(
t.x*grid+8,
t.y*grid+8,
grid-16,
grid-16
)

}

for(let e of enemies){

ctx.fillStyle="red"

ctx.beginPath()

ctx.arc(
e.x*grid+grid/2,
e.y*grid+grid/2,
8,
0,
Math.PI*2
)

ctx.fill()

}

}

function updateUI(){

document.getElementById("money").innerText=money
document.getElementById("health").innerText=health
document.getElementById("wave").innerText=wave

}

function gameOver(){

document.getElementById("gameover").style.display="block"

document.getElementById("finalWave").innerText=wave

let best=localStorage.getItem("bestWave")

if(!best || wave>best){
localStorage.setItem("bestWave",wave)
}

}

function gameLoop(){

update()
draw()

requestAnimationFrame(gameLoop)

}

gameLoop()
