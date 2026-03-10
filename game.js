const canvas = document.getElementById("game")
const ctx = canvas.getContext("2d")

const tooltip = document.getElementById("tooltip")
const towerBar = document.getElementById("towerBar")

let money = 300
let health = 100
let speed = 1

let towers=[]
let enemies=[]
let bullets=[]

let selectedTower=null
let mouseX=0
let mouseY=0

// river path bottom → top
const path=[
{x:480,y:600},
{x:480,y:450},
{x:650,y:420},
{x:700,y:260},
{x:550,y:150},
{x:400,y:0}
]

const towerData=[

{name:"Basic",damage:10,rate:60,range:140,cost:100,icon:"https://cdn-icons-png.flaticon.com/512/616/616494.png"},
{name:"Rapid",damage:6,rate:25,range:120,cost:150,icon:"https://cdn-icons-png.flaticon.com/512/3523/3523063.png"},
{name:"Sniper",damage:30,rate:100,range:260,cost:220,icon:"https://cdn-icons-png.flaticon.com/512/2917/2917990.png"},
{name:"Freeze",damage:5,rate:70,range:150,cost:180,icon:"https://cdn-icons-png.flaticon.com/512/149/149852.png"},
{name:"Cannon",damage:20,rate:80,range:170,cost:200,icon:"https://cdn-icons-png.flaticon.com/512/833/833472.png"},
{name:"Splash",damage:18,rate:90,range:160,cost:180,icon:"https://cdn-icons-png.flaticon.com/512/861/861060.png"},
{name:"Laser",damage:22,rate:50,range:200,cost:250,icon:"https://cdn-icons-png.flaticon.com/512/483/483947.png"},
{name:"Poison",damage:12,rate:70,range:160,cost:200,icon:"https://cdn-icons-png.flaticon.com/512/616/616408.png"},
{name:"Farm",damage:0,rate:0,range:0,cost:200,icon:"https://cdn-icons-png.flaticon.com/512/427/427735.png"},
{name:"Support",damage:8,rate:100,range:180,cost:220,icon:"https://cdn-icons-png.flaticon.com/512/149/149060.png"}

]

// create tower icons
towerData.forEach((t,i)=>{

let div=document.createElement("div")
div.className="tower"

div.innerHTML=
`<img src="${t.icon}">
<div class="price">$${t.cost}</div>`

div.onmouseenter=()=>{
tooltip.innerHTML=
t.name+"<br>"+
"Damage: "+t.damage+"<br>"+
"Speed: "+t.rate+"<br>"+
"Range: "+t.range+"<br>"+
"Cost: $"+t.cost
}

div.onclick=()=>{
selectedTower=i
}

towerBar.appendChild(div)

})

canvas.addEventListener("mousemove",e=>{
let rect=canvas.getBoundingClientRect()
mouseX=e.clientX-rect.left
mouseY=e.clientY-rect.top
})

canvas.addEventListener("click",()=>{

if(selectedTower===null)return

let t=towerData[selectedTower]

if(money<t.cost)return

towers.push({
x:mouseX,
y:mouseY,
type:selectedTower,
cool:0
})

money-=t.cost

})

function startWave(){

for(let i=0;i<6;i++){

setTimeout(()=>{
spawnEnemy()
},i*800)

}

}

function spawnEnemy(){

enemies.push({
x:path[0].x,
y:path[0].y,
hp:60,
speed:0.8,
step:0
})

}

function toggleSpeed(){

speed=speed===1?2:1

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

let dist=Math.sqrt(dx*dx+dy*dy)

e.x+=dx/dist*e.speed*speed
e.y+=dy/dist*e.speed*speed

if(dist<5)e.step++

}

for(let t of towers){

let stats=towerData[t.type]

t.cool--

if(t.cool>0||!stats.range)continue

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

function draw(){

ctx.clearRect(0,0,canvas.width,canvas.height)

// grass
ctx.fillStyle="#5ca66b"
ctx.fillRect(0,0,canvas.width,canvas.height)

// river
ctx.strokeStyle="#3aa0ff"
ctx.lineWidth=70

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
ctx.arc(t.x,t.y,15,0,Math.PI*2)
ctx.fill()

let stats=towerData[t.type]

ctx.strokeStyle="rgba(255,255,255,0.2)"
ctx.beginPath()
ctx.arc(t.x,t.y,stats.range,0,Math.PI*2)
ctx.stroke()

}

// fish enemies
for(let e of enemies){

ctx.fillStyle="orange"

ctx.beginPath()
ctx.arc(e.x,e.y,12,0,Math.PI*2)
ctx.fill()

}

// bullets
for(let b of bullets){

ctx.fillStyle="yellow"

ctx.beginPath()
ctx.arc(b.x,b.y,4,0,Math.PI*2)
ctx.fill()

}

// preview circle
if(selectedTower!==null){

let stats=towerData[selectedTower]

ctx.strokeStyle="rgba(255,255,255,0.3)"
ctx.beginPath()
ctx.arc(mouseX,mouseY,stats.range,0,Math.PI*2)
ctx.stroke()

}

}

function loop(){

update()
draw()

document.getElementById("money").innerText=money
document.getElementById("health").innerText=health

requestAnimationFrame(loop)

}

loop()

