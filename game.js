const canvas = document.getElementById("game")
const ctx = canvas.getContext("2d")

let money = 300
let health = 100
let gameSpeed = 1

let towers = []
let enemies = []
let bullets = []

let selectedTower = null

const path = [
{x:500,y:600},
{x:500,y:420},
{x:700,y:420},
{x:700,y:200},
{x:300,y:200},
{x:300,y:0}
]

const towersData = [

{range:140,rate:60,damage:10,cost:100},
{range:120,rate:25,damage:6,cost:150},
{range:260,rate:100,damage:28,cost:220},
{range:140,rate:70,damage:4,cost:180},
{range:160,rate:80,damage:18,cost:200},
{range:150,rate:90,damage:14,cost:180},
{range:200,rate:50,damage:20,cost:250},
{range:160,rate:70,damage:12,cost:200},
{range:0,rate:0,damage:0,cost:200},
{range:180,rate:100,damage:8,cost:220}

]

function selectTower(id){
selectedTower = id
}

canvas.addEventListener("click", e=>{

if(selectedTower === null) return

let rect = canvas.getBoundingClientRect()

let x = e.clientX - rect.left
let y = e.clientY - rect.top

let stats = towersData[selectedTower]

if(money < stats.cost) return

towers.push({
x,y,
type:selectedTower,
cool:0
})

money -= stats.cost
updateUI()

})

function startWave(){

for(let i=0;i<6;i++){

setTimeout(()=>{
spawnEnemy()
}, i*800)

}

}

function spawnEnemy(){

enemies.push({
x:path[0].x,
y:path[0].y,
hp:50,
speed:0.7,
step:0
})

}

function toggleSpeed(){
gameSpeed = gameSpeed === 1 ? 2 : 1
}

function update(){

for(let e of enemies){

let target = path[e.step+1]

if(!target){
health--
e.dead = true
continue
}

let dx = target.x - e.x
let dy = target.y - e.y

let dist = Math.sqrt(dx*dx + dy*dy)

e.x += dx/dist * e.speed * gameSpeed
e.y += dy/dist * e.speed * gameSpeed

if(dist < 5) e.step++

}

for(let t of towers){

let stats = towersData[t.type]

t.cool--

if(t.cool > 0) continue
if(!stats.range) continue

for(let e of enemies){

let dx = e.x - t.x
let dy = e.y - t.y

let dist = Math.sqrt(dx*dx + dy*dy)

if(dist < stats.range){

bullets.push({
x:t.x,
y:t.y,
target:e,
dmg:stats.damage
})

t.cool = stats.rate
break

}

}

}

for(let b of bullets){

let dx = b.target.x - b.x
let dy = b.target.y - b.y

let dist = Math.sqrt(dx*dx + dy*dy)

b.x += dx/dist * 4
b.y += dy/dist * 4

if(dist < 10){
b.target.hp -= b.dmg
b.dead = true
}

}

bullets = bullets.filter(b=>!b.dead)

enemies = enemies.filter(e=>{

if(e.hp <= 0){
money += 10
return false
}

return !e.dead

})

}

function draw(){

ctx.clearRect(0,0,canvas.width,canvas.height)

ctx.fillStyle="#4fa96c"
ctx.fillRect(0,0,canvas.width,canvas.height)

ctx.strokeStyle="#3aa0ff"
ctx.lineWidth=60

ctx.beginPath()

ctx.moveTo(path[0].x,path[0].y)

for(let p of path){
ctx.lineTo(p.x,p.y)
}

ctx.stroke()

for(let t of towers){

ctx.fillStyle="#222"

ctx.beginPath()
ctx.arc(t.x,t.y,14,0,Math.PI*2)
ctx.fill()

let stats = towersData[t.type]

ctx.strokeStyle="rgba(255,255,255,0.2)"
ctx.beginPath()
ctx.arc(t.x,t.y,stats.range,0,Math.PI*2)
ctx.stroke()

}

for(let e of enemies){

ctx.fillStyle="orange"

ctx.beginPath()
ctx.arc(e.x,e.y,10,0,Math.PI*2)
ctx.fill()

}

for(let b of bullets){

ctx.fillStyle="yellow"

ctx.beginPath()
ctx.arc(b.x,b.y,4,0,Math.PI*2)
ctx.fill()

}

}

function updateUI(){

document.getElementById("money").innerText = money
document.getElementById("health").innerText = health

}

function loop(){

update()
draw()
updateUI()

requestAnimationFrame(loop)

}

loop()
