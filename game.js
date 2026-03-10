const canvas = document.getElementById("game")
const ctx = canvas.getContext("2d")

let gridSize = 50
let cols = 18
let rows = 12

let towers=[]
let enemies=[]
let bullets=[]

let money=300
let wave=1
let air=0

let playerName=""
let selectedTower=null

const towerCosts={
rod:100,
rapid:150,
farm:200,
support:180
}

const tiers=[
"Bronze",
"Silver",
"Gold",
"Diamond",
"Mythic"
]

let difficultyStats={
easy:{money:400,scale:0.8},
medium:{money:300,scale:1},
hard:{money:200,scale:1.3},
insane:{money:150,scale:1.7}
}

let path=[]

function startGame(){

playerName=document.getElementById("playerName").value || "Player"

const diff=document.getElementById("difficulty").value

money=difficultyStats[diff].money

path=generatePath()

document.getElementById("menu").style.display="none"
document.getElementById("gameUI").style.display="block"

updateUI()

spawnWave()

gameLoop()

}

function generatePath(){

return[
{x:0,y:5},
{x:4,y:5},
{x:4,y:9},
{x:12,y:9},
{x:12,y:3},
{x:17,y:3}
]

}

function selectTower(type){

selectedTower=type

}

canvas.addEventListener("click",e=>{

const rect=canvas.getBoundingClientRect()

const x=Math.floor((e.clientX-rect.left)/gridSize)
const y=Math.floor((e.clientY-rect.top)/gridSize)

if(selectedTower){

let cost=towerCosts[selectedTower]

if(money<cost) return

towers.push({
x,y,
type:selectedTower,
tier:0,
cool:0
})

money-=cost
selectedTower=null

updateUI()

}

})

function spawnWave(){

for(let i=0;i<wave*2;i++){

setTimeout(()=>{

enemies.push({

x:path[0].x,
y:path[0].y,
hp:50+wave*10,
speed:0.02+wave*0.002,
step:0

})

},i*500)

}

}

function update(){

for(let e of enemies){

let target=path[e.step+1]

if(!target) continue

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

if(t.cool<=0){

let range=3+t.tier

for(let e of enemies){

let dx=e.x-t.x
let dy=e.y-t.y

let dist=Math.sqrt(dx*dx+dy*dy)

if(dist<range){

bullets.push({

x:t.x,
y:t.y,
target:e,
dmg:10+5*t.tier

})

t.cool=(t.type==="rapid")?10:25

break

}

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

money+=2

return false

}

return true

})

}

function draw(){

ctx.clearRect(0,0,canvas.width,canvas.height)

for(let x=0;x<cols;x++){
for(let y=0;y<rows;y++){

ctx.strokeStyle="#3e4b3e"
ctx.strokeRect(x*gridSize,y*gridSize,gridSize,gridSize)

}
}

ctx.strokeStyle="yellow"
ctx.lineWidth=6
ctx.beginPath()

for(let i=0;i<path.length;i++){

let p=path[i]

let px=p.x*gridSize+25
let py=p.y*gridSize+25

if(i===0) ctx.moveTo(px,py)
else ctx.lineTo(px,py)

}

ctx.stroke()

for(let t of towers){

ctx.fillStyle={
rod:"blue",
rapid:"cyan",
farm:"green",
support:"purple"
}[t.type]

ctx.fillRect(
t.x*gridSize+10,
t.y*gridSize+10,
30,
30
)

}

for(let e of enemies){

ctx.fillStyle="red"

ctx.beginPath()

ctx.arc(
e.x*gridSize+25,
e.y*gridSize+25,
10,
0,
Math.PI*2
)

ctx.fill()

}

for(let b of bullets){

ctx.fillStyle="white"

ctx.beginPath()

ctx.arc(
b.x*gridSize+25,
b.y*gridSize+25,
4,
0,
Math.PI*2
)

ctx.fill()

}

}

function nextWave(){

money+=50+wave

if(wave%10===0){
air++
}

wave++

updateUI()

spawnWave()

}

function activateAirstrike(){

if(air<=0) return

canvas.addEventListener("click",strike,{once:true})

}

function strike(e){

const rect=canvas.getBoundingClientRect()

let x=(e.clientX-rect.left)/gridSize
let y=(e.clientY-rect.top)/gridSize

for(let enemy of enemies){

let dx=enemy.x-x
let dy=enemy.y-y

let dist=Math.sqrt(dx*dx+dy*dy)

if(dist<2){

enemy.hp-=200

}

}

air--

updateUI()

}

function updateUI(){

document.getElementById("money").innerText=money
document.getElementById("wave").innerText=wave
document.getElementById("air").innerText=air

}

function gameLoop(){

update()
draw()

if(enemies.length===0){

nextWave()

}

requestAnimationFrame(gameLoop)

}

function saveScore(){

let scores=JSON.parse(localStorage.getItem("tdscores")||"[]")

scores.push({name:playerName,wave:wave})

scores.sort((a,b)=>b.wave-a.wave)

scores=scores.slice(0,10)

localStorage.setItem("tdscores",JSON.stringify(scores))

}

function loadLeaderboard(){

let scores=JSON.parse(localStorage.getItem("tdscores")||"[]")

let html=""

for(let s of scores){

html+=`${s.name} - Wave ${s.wave}<br>`

}

document.getElementById("leaderboard").innerHTML=html

}

loadLeaderboard()