const canvas = document.getElementById("game")
const ctx = canvas.getContext("2d")

let money = 300
let health = 100
let speed = 1

let towers=[]
let enemies=[]
let bullets=[]

let selectedTower=null

// river path
const path=[
{x:500,y:600},
{x:500,y:420},
{x:700,y:420},
{x:700,y:200},
{x:300,y:200},
{x:300,y:0}
]

// tower types
const towerTypes=[

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

// select tower
function selectTower(id){

selectedTower=id

}

// place tower
canvas.onclick=e=>{

if(selectedTower===null)return

let rect=canvas.getBoundingClientRect()

let x=e.clientX-rect.left
let y=e.clientY-rect.top

let t=towerTypes[selectedTower]

if(money<t.cost)return

towers.push({

x,y,
type:selectedTower,
cool:0

})

money-=t.cost
updateUI()

}

// spawn enemies
function startWave(){

for(let i=0;i<6;i++){

setTimeout(()=>{

enemies.push({

x:path[0].x,
y:path[0].y,
hp:50,
speed:0.6,
step:0

})

},i*900)

}

}

// speed toggle
function toggleSpeed(){

speed = speed===1 ? 2 : 1

}

// update
function update(){

// move enemies
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

e.x+=dx/dist*e.speed*speed
e.y+=dy/dist*e.speed*speed

if(dist<5){
e.step++
}

}

// towers shoot
for(let t of towers){

let stats=towerTypes[t.type]

t.cool--

if(t.cool>0)continue

for(let e of enemies){

let dx=e.x-t.x
let dy=e.y-t.y

let dist=Math.sqrt(dx*dx+dy*dy)

if(dist<stats.range){

bullets.push({

x:t.x,
y:t.y,
target:e,
dmg:stats.damage

})

t.cool=stats.rate
break

}

}

}

// bullets
for(let b of bullets){

let dx=b.target.x-b.x
let dy=b.target.y-b.y

let dist=Math.sqrt(dx*dx+dy*dy)

b.x+=dx/dist*4
b.y+=dy/dist*4

if(dist<10){

b.target.hp-=b.dmg
b.dead=true

}

}

bullets=bullets.filter(b=>!b.dead)

enemies=enemies.filter(e=>{

if(e.hp<=0){

money+=10
return false

}

return !e.dead

})

}

// draw
function draw(){

ctx.clearRect(0,0,canvas.width,canvas.height)

// grass
ctx.fillStyle="#4fa96c"
ctx.fillRect(0,0,canvas.width,canvas.height)

// river
ctx.strokeStyle="#3aa0ff"
ctx.lineWidth=60

ctx.beginPath()

ctx.moveTo(path[0].x,path[0].y)

for(let p of path){
ctx.lineTo(p.x,p.y)
}

ctx.stroke()

// towers
for(let t of towers){

ctx.fillStyle="#222"

ctx.beginPath()
ctx.arc(t.x,t.y,14,0,Math.PI*2)
ctx.fill()

// range circle
let stats=towerTypes[t.type]

ctx.strokeStyle="rgba(255,255,255,0.2)"
ctx.beginPath()
ctx.arc(t.x,t.y,stats.range,0,Math.PI*2)
ctx.stroke()

}

// enemies (fish)
for(let e of enemies){

ctx.fillStyle="orange"

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

// UI
function updateUI(){

document.getElementById("money").innerText=money
document.getElementById("health").innerText=health

}

// loop
function loop(){

update()
draw()
updateUI()

requestAnimationFrame(loop)

}

loop()
