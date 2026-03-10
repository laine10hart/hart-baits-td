const canvas = document.getElementById("game")
const ctx = canvas.getContext("2d")

let money = 300
let health = 100
let wave = 1
let gameSpeed = 1

let towers=[]
let enemies=[]
let bullets=[]

let selectedTowerType=null
let selectedTower=null

// river path bottom → top
const path=[
{x:450,y:550},
{x:450,y:420},
{x:650,y:420},
{x:650,y:200},
{x:300,y:200},
{x:300,y:0}
]

// tower stats
const towerStats={

rod:{cost:100,range:140,rate:60,damage:12},
rapid:{cost:150,range:130,rate:25,damage:6},
sniper:{cost:220,range:260,rate:100,damage:28},
freeze:{cost:180,range:140,rate:70,damage:4},
farm:{cost:200}

}

// click canvas
canvas.addEventListener("click",e=>{

const rect=canvas.getBoundingClientRect()

let x=e.clientX-rect.left
let y=e.clientY-rect.top

// place tower
if(selectedTowerType){

let stats=towerStats[selectedTowerType]

if(money<stats.cost)return

towers.push({
x,y,
type:selectedTowerType,
tier:1,
cool:0
})

money-=stats.cost
updateUI()
return
}

// select tower
for(let t of towers){

let dx=t.x-x
let dy=t.y-y

if(Math.sqrt(dx*dx+dy*dy)<20){

selectedTower=t
showTowerInfo()

}

}

})

// select tower type
function selectTower(type){
selectedTowerType=type
}

// show tower info
function showTowerInfo(){

if(!selectedTower)return

document.getElementById("towerInfo").innerHTML=

"Tower: "+selectedTower.type+
"<br>Level: "+selectedTower.tier

}

// upgrade tower
document.getElementById("upgradeBtn").onclick=()=>{

if(!selectedTower)return

let cost=70*selectedTower.tier

if(money<cost)return

money-=cost
selectedTower.tier++

showTowerInfo()
updateUI()

}

// sell tower
document.getElementById("sellBtn").onclick=()=>{

if(!selectedTower)return

money+=60

towers=towers.filter(t=>t!==selectedTower)

selectedTower=null

document.getElementById("towerInfo").innerHTML="Select a tower"

updateUI()

}

// start wave
function startWave(){

for(let i=0;i<wave*4;i++){

setTimeout(spawnEnemy,i*900)

}

}

// spawn enemy
function spawnEnemy(){

enemies.push({
x:path[0].x,
y:path[0].y,
hp:50+wave*12,
speed:0.7,
step:0
})

}

// toggle speed
function toggleSpeed(){

gameSpeed = gameSpeed===1 ? 2 : 1

}

// update
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

let dist=Math.sqrt(dx*dx+dy*dy)

e.x += dx/dist * e.speed * gameSpeed
e.y += dy/dist * e.speed * gameSpeed

if(dist<5){
e.step++
}

}

// towers shoot
for(let t of towers){

t.cool--

if(t.cool>0)continue

let stats=towerStats[t.type]

if(!stats.range)continue

for(let e of enemies){

let dx=e.x-t.x
let dy=e.y-t.y

let dist=Math.sqrt(dx*dx+dy*dy)

if(dist<stats.range){

bullets.push({
x:t.x,
y:t.y,
target:e,
dmg:stats.damage*t.tier
})

t.cool=stats.rate
break

}

}

}

// bullets move
for(let b of bullets){

let dx=b.target.x-b.x
let dy=b.target.y-b.y

let dist=Math.sqrt(dx*dx+dy*dy)

b.x+=dx/dist*4*gameSpeed
b.y+=dy/dist*4*gameSpeed

if(dist<10){

b.target.hp-=b.dmg
b.dead=true

}

}

bullets=bullets.filter(b=>!b.dead)

enemies=enemies.filter(e=>{

if(e.hp<=0){

money+=12
return false

}

return !e.dead

})

if(health<=0){

alert("Game Over")

}

}

// draw
function draw(){

ctx.clearRect(0,0,canvas.width,canvas.height)

// grass
ctx.fillStyle="#3f7f3f"
ctx.fillRect(0,0,canvas.width,canvas.height)

// river
ctx.strokeStyle="#3aa0ff"
ctx.lineWidth=50

ctx.beginPath()

ctx.moveTo(path[0].x,path[0].y)

for(let p of path){
ctx.lineTo(p.x,p.y)
}

ctx.stroke()

// towers
for(let t of towers){

ctx.fillStyle="#333"

ctx.beginPath()
ctx.arc(t.x,t.y,15,0,Math.PI*2)
ctx.fill()

}

// enemies
for(let e of enemies){

ctx.fillStyle="red"

ctx.beginPath()
ctx.arc(e.x,e.y,10,0,Math.PI*2)
ctx.fill()

}

// bullets
for(let b of bullets){

ctx.fillStyle="yellow"

ctx.beginPath()
ctx.arc(b.x,b.y,4,0,Math.PI*2)
ctx.fill()

}

}

// update UI
function updateUI(){

document.getElementById("money").innerText=money
document.getElementById("health").innerText=health
document.getElementById("wave").innerText=wave

}

// main loop
function loop(){

update()
draw()

requestAnimationFrame(loop)

}

loop()
