const canvas = document.getElementById("game")
const ctx = canvas.getContext("2d")

const grid = 50

let money = 300
let health = 20
let wave = 1

let towers = []
let enemies = []

let selectedTowerType = null
let selectedTower = null

const towerStats = {
rod:{cost:100,range:140,rate:60,damage:12},
rapid:{cost:150,range:120,rate:25,damage:6},
farm:{cost:200}
}

const path = [
{x:0,y:250},
{x:200,y:250},
{x:200,y:420},
{x:650,y:420},
{x:650,y:120},
{x:900,y:120}
]

canvas.addEventListener("click",e=>{

const rect = canvas.getBoundingClientRect()

let x = e.clientX - rect.left
let y = e.clientY - rect.top

if(selectedTowerType){

let cost = towerStats[selectedTowerType].cost

if(money < cost) return

towers.push({
x,y,
type:selectedTowerType,
cool:0,
tier:1
})

money -= cost
updateUI()

return
}

for(let t of towers){

let dx = t.x - x
let dy = t.y - y

if(Math.sqrt(dx*dx+dy*dy) < 20){

selectedTower = t
showTowerInfo()

}

}

})

function selectTower(type){
selectedTowerType = type
}

function showTowerInfo(){

if(!selectedTower) return

document.getElementById("towerInfo").innerHTML =
selectedTower.type + "<br>Level: " + selectedTower.tier

}

document.getElementById("upgradeBtn").onclick = ()=>{

if(!selectedTower) return

let cost = 70 * selectedTower.tier

if(money < cost) return

money -= cost
selectedTower.tier++

updateUI()
showTowerInfo()

}

document.getElementById("sellBtn").onclick = ()=>{

if(!selectedTower) return

money += 50

towers = towers.filter(t => t !== selectedTower)

selectedTower = null

updateUI()

}

function startWave(){

for(let i=0;i<wave*4;i++){

setTimeout(spawnEnemy,i*900)

}

}

function spawnEnemy(){

enemies.push({
x:path[0].x,
y:path[0].y,
hp:40 + wave*10,
speed:0.6,
step:0
})

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

let dist = Math.sqrt(dx*dx+dy*dy)

e.x += dx/dist * e.speed
e.y += dy/dist * e.speed

if(dist < 5){
e.step++
}

}

enemies = enemies.filter(e => !e.dead)

if(health <= 0){
alert("Game Over")
}

}

function draw(){

ctx.clearRect(0,0,canvas.width,canvas.height)

// grass
ctx.fillStyle = "#3f6f3f"
ctx.fillRect(0,0,canvas.width,canvas.height)

// river path
ctx.strokeStyle = "#3aa0ff"
ctx.lineWidth = 40

ctx.beginPath()

ctx.moveTo(path[0].x,path[0].y)

for(let p of path){
ctx.lineTo(p.x,p.y)
}

ctx.stroke()

// towers
for(let t of towers){

ctx.fillStyle = "#333"

ctx.beginPath()
ctx.arc(t.x,t.y,15,0,Math.PI*2)
ctx.fill()

}

// enemies
for(let e of enemies){

ctx.fillStyle = "red"

ctx.beginPath()
ctx.arc(e.x,e.y,10,0,Math.PI*2)
ctx.fill()

}

}

function updateUI(){

document.getElementById("money").innerText = money
document.getElementById("health").innerText = health
document.getElementById("wave").innerText = wave

}

function loop(){

update()
draw()

requestAnimationFrame(loop)

}

loop()
