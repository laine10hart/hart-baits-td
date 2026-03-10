const canvas=document.getElementById("game")
const ctx=canvas.getContext("2d")

const grid=40

let towers=[]
let enemies=[]
let bullets=[]

let money=300
let health=20
let wave=1

let selectedTowerType=null
let selectedTower=null

const maps={

river:[
{x:0,y:5},{x:5,y:5},{x:5,y:9},{x:14,y:9},{x:14,y:3},{x:21,y:3}
],

swamp:[
{x:0,y:8},{x:6,y:8},{x:6,y:2},{x:14,y:2},{x:14,y:9},{x:21,y:9}
],

harbor:[
{x:0,y:4},{x:6,y:4},{x:6,y:10},{x:16,y:10},{x:16,y:3},{x:21,y:3}
]

}

let path=maps.river

function startGame(){

let map=document.getElementById("mapSelect").value

path=maps[map]

document.getElementById("startMenu").style.display="none"
document.getElementById("gameContainer").style.display="flex"

}

const towerStats={

rod:{cost:100,range:3,rate:40,damage:10},
rapid:{cost:150,range:3,rate:15,damage:6},
farm:{cost:200},
support:{cost:180,range:4}

}

canvas.addEventListener("click",e=>{

const rect=canvas.getBoundingClientRect()

let x=Math.floor((e.clientX-rect.left)/grid)
let y=Math.floor((e.clientY-rect.top)/grid)

if(selectedTowerType){

let stats=towerStats[selectedTowerType]

if(money<stats.cost)return

let tower={
x,y,
type:selectedTowerType,
tier:1,
cool:0
}

towers.push(tower)

money-=stats.cost
updateUI()

return
}

for(let t of towers){

if(t.x==x && t.y==y){

selectedTower=t
showTowerInfo()

}

}

})

function selectTower(type){

selectedTowerType=type
selectedTower=null

}

function showTowerInfo(){

if(!selectedTower)return

document.getElementById("towerInfo").innerHTML=`

Type: ${selectedTower.type}<br>
Tier: ${selectedTower.tier}

`

}

document.getElementById("upgradeBtn").onclick=()=>{

if(!selectedTower)return

let cost=50*selectedTower.tier

if(money<cost)return

money-=cost
selectedTower.tier++

showTowerInfo()
updateUI()

}

document.getElementById("sellBtn").onclick=()=>{

if(!selectedTower)return

money+=50

towers=towers.filter(t=>t!=selectedTower)

selectedTower=null
updateUI()

}

function nextWave(){

for(let i=0;i<wave*3;i++){

setTimeout(()=>spawnEnemy(),i*500)

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

enemies=enemies.filter(e=>!e.dead)

if(health<=0){

alert("Game Over")

}

}

function draw(){

ctx.clearRect(0,0,canvas.width,canvas.height)

ctx.strokeStyle="yellow"
ctx.lineWidth=6

ctx.beginPath()

for(let i=0;i<path.length;i++){

let p=path[i]

let px=p.x*grid+grid/2
let py=p.y*grid+grid/2

if(i==0)ctx.moveTo(px,py)
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

function loop(){

update()
draw()

requestAnimationFrame(loop)

}

loop()
