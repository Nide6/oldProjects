import Item from "./itemsClass"
import MapItem from "./mapClass"
import Operations from "./operationsClass"

interface Point {
    x:number
    y:number
}

export const operations = new Operations()

const items = document.getElementById('items') as HTMLDivElement
const map = document.getElementById('map') as HTMLDivElement
export let moved = false
let moving = false
let x = 0 as number
let y = 0 as number
const selectedRectangle = document.getElementById('prostokat') as HTMLDivElement

/**
 * showing and hiding menu
 */
document.addEventListener('contextmenu', function(){
    document.getElementById('menu').style.display='flex'
})
document.getElementsByTagName('body')[0].addEventListener('click',function(){
    document.getElementById('menu').style.display='none'
})

/**
 * adding the option to select multiple points
 * connected with mousemove and mouseup events
 */
document.addEventListener('mousedown', function (e) {
    console.log(e.which==1)
    if(!operations.paste && e.which==1){

        e.preventDefault()
        x = e.pageX
        y = e.pageY
        selectedRectangle.style.left = `${e.pageX}px`
        selectedRectangle.style.top = `${e.pageY}px`
        selectedRectangle.style.width = "0px"
        selectedRectangle.style.height = "0px"
        if (!e.ctrlKey && !e.metaKey) {
            const selected = document.getElementsByClassName('selected') as HTMLCollectionOf<HTMLElement>
            Array.from(selected).forEach(element => {
                element.className = 'mapItem'
                element.style.border = '1px solid white'
            })
        }
        if (x > 415 && y > 43) {
            moving = true
        }
    }
})

document.addEventListener('keydown', function(e){
    e.preventDefault()
    if(e.key == 'Delete'){
        const selected = document.getElementsByClassName('selected') as HTMLCollectionOf<HTMLElement>
        Array.from(selected).forEach(element => {
            element.className = 'mapItem'
            element.style.border = '1px solid white'
        })
    operations.selected = []
    } else if((e.ctrlKey && e.key=='v')||(e.metaKey && e.key=='v')){
        if(ready){
            operations.paste = true
            testCanvas.style.display='block'
            operations.painting= true
        }
    } else if((e.ctrlKey && e.key=='c')||(e.metaKey && e.key=='c')){
        copy()
    } else if((e.ctrlKey && e.key=='x')||(e.metaKey && e.key=='x')){
        cut()
    } else if((e.ctrlKey && e.key=='y')||(e.metaKey && e.key=='y')){
        redo()
    } else if((e.ctrlKey && e.key=='z')||(e.metaKey && e.key=='z')){
        undo()
    } else if((e.ctrlKey && e.key=='s')||(e.metaKey && e.key=='s')){
        document.getElementById('download').click()
    } else if((e.ctrlKey && e.key=='l')||(e.metaKey && e.key=='l')){
        loadF()
    }
})

document.addEventListener("mouseup", function moseUp() {
    if(!operations.paste){
        setTimeout(() => {
            moving = false
            if (moved) {
                moved = false
                let divs = document.getElementsByClassName('mapItem') as HTMLCollectionOf<HTMLElement>
                const div2 = selectedRectangle.getBoundingClientRect()
                for (let i = 0; i < divs.length; i += 1) {
                    const div1 = divs[i].getBoundingClientRect()
                    if (div1.left < div2.right && div1.right > div2.left && div1.top < div2.bottom && div1.bottom > div2.top) {
                        if(divs[i].classList.contains('selected')){
                            divs[i].className='mapItem'
                            divs[i].style.border = '1px solid white'
                            console.log('test')
                            let x = 1 + 49 * Number(divs[i].id.split(':')[1])
                            let y = 1 + 49 * Number(divs[i].id.split(':')[2])
                            for(let i=0; i<operations.selected.length; i+=1){
                                if(operations.selected[i].x == x&&operations.selected[i].y == y){
                                    operations.selected.splice(i, 1)
                                }
                            }
                        } else {
                            divs[i].classList.add('selected')
                            divs[i].style.border = 'none'
                            let x = 1 + 49 * Number(divs[i].id.split(':')[1])
                            let y = 1 + 49 * Number(divs[i].id.split(':')[2])
                            operations.selected.push({ x: x, y: y })
                        }
                    }
                }
            }
            selectedRectangle.style.width = "0px"
            selectedRectangle.style.height = "0px"
        }, 10);
    }
})

document.addEventListener('mousemove', function move(e) {
    if(!operations.paste){

        if (moving) {
            moved = true
            if (!e.ctrlKey && !e.metaKey) {
                operations.selected = []
            }
            if (e.pageX - x > 0) {
                selectedRectangle.style.width = `${e.pageX - x}px`
            } else {
                if (e.pageX < 415) {
                    selectedRectangle.style.left = `${415}px`
                    selectedRectangle.style.width = `${x - 415}px`
                } else {
                    selectedRectangle.style.left = `${e.pageX}px`
                    selectedRectangle.style.width = `${x - e.pageX}px`
                }
            }
            if (e.pageY - y > 0) {
                selectedRectangle.style.top = `${y}px`
                selectedRectangle.style.height = `${e.pageY - y}px`
            } else {
                if (e.pageY < 43) {
                    selectedRectangle.style.top = `${43}px`
                    selectedRectangle.style.height = `${y - 43}px`
                } else {
                    selectedRectangle.style.top = `${e.pageY}px`
                    selectedRectangle.style.height = `${y - e.pageY}px`
                }
            }
            let divs = document.getElementsByClassName('mapItem') as HTMLCollectionOf<HTMLElement>
            const div2 = selectedRectangle.getBoundingClientRect()
            for (let i = 0; i < divs.length; i += 1) {
                const div1 = divs[i].getBoundingClientRect()
                if (div1.left < div2.right && div1.right > div2.left && div1.top < div2.bottom && div1.bottom > div2.top) {
                    divs[i].style.border = 'none'
                } else if(!divs[i].classList.contains('selected')){
                    divs[i].style.border = '1px solid white'
                }
            }
        }
    }
})

const itemsCanvas = document.createElement('canvas') as HTMLCanvasElement
itemsCanvas.id = 'itemsCanvas'
itemsCanvas.width = 785
itemsCanvas.height = 1961
const itemCtx = itemsCanvas.getContext('2d') as CanvasRenderingContext2D
itemCtx.rect(0, 0, 785, 1961)
itemCtx.fillStyle = 'black'
itemCtx.fill()

async function itemsGenerate() {
    const img = await document.getElementById('sprite') as HTMLImageElement
    setTimeout(() => {
        for (let i: number = 0; i < 20; i += 1) {
            for (let j: number = 0; j < 16; j += 1) { debugger
                const itemElem1 = new Item
                itemElem1.setImg(img)
                itemElem1.setPosition({ x: j, y: i })
                itemElem1.setCanvasPosition({ x: 1 + 48 * j, y: 1 + 48 * i })
                const itemElem2 = new Item
                itemElem2.setPosition({ x: j, y: i + 20 })
                itemElem2.setImg(img)
                itemElem2.setCanvasPosition({ x: 1 + 48 * (j + 16), y: 1 + 48 * i })
                if (i == 19) {
                    itemCtx.drawImage(img, 1 + 48 * j, 1 + 48 * i, 47, 46, 1 + 48 * j + 1 * j, 1 + 48 * i + 1 * i, 47, 47)
                } else {
                    itemCtx.drawImage(img, 1 + 48 * j, 1 + 48 * i, 47, 47, 1 + 48 * j + 1 * j, 1 + 48 * i + 1 * i, 47, 47)
                }
                if (i == 19) {
                    if (j == 15) {
                        itemCtx.drawImage(img, 1 + 48 * (j + 16), 1 + 48 * i, 46, 46, 1 + 48 * j + 1 * j, 1 + 48 * (i + 20) + 1 * (i + 20), 47, 47)
                    } else {
                        itemCtx.drawImage(img, 1 + 48 * (j + 16), 1 + 48 * i, 47, 46, 1 + 48 * j + 1 * j, 1 + 48 * (i + 20) + 1 * (i + 20), 47, 47)
                    }
                } else {
                    if (j == 15) {
                        itemCtx.drawImage(img, 1 + 48 * (j + 16), 1 + 48 * i, 46, 47, 1 + 48 * j + 1 * j, 1 + 48 * (i + 20) + 1 * (i + 20), 47, 47)
                    } else {
                        itemCtx.drawImage(img, 1 + 48 * (j + 16), 1 + 48 * i, 47, 47, 1 + 48 * j + 1 * j, 1 + 48 * (i + 20) + 1 * (i + 20), 47, 47)
                    }
                }
            }
        }
    }, 0);
}

itemsGenerate()
items.appendChild(itemsCanvas)

document.getElementById('download').addEventListener('click', function(){
    document.getElementById('menu').style.display='none'
})

const mapCanvas = document.getElementById('mapCanvas') as HTMLCanvasElement
mapCanvas.id = 'mapCanvas'
mapCanvas.width = 736
mapCanvas.height = 980
const mapCtx = mapCanvas.getContext('2d') as CanvasRenderingContext2D
mapCtx.rect(0, 0, 736, 980)
mapCtx.fillStyle = 'black'
mapCtx.fill()

async function mapGenerate() {
    const img = await document.getElementById('sprite') as HTMLImageElement
    for (let i: number = 0; i < 20; i += 1) {
        for (let j: number = 0; j <15; j += 1) {
            const item = new MapItem
            item.setImg(img)
            item.setPosition({ x: j, y: i })
        }
    }
}

mapGenerate()
const downloader = document.getElementById('download') as HTMLAnchorElement
mapCanvas.toBlob(function(blob){
    let url = URL.createObjectURL(blob)
    downloader.href = url
    downloader.download = 'mapa.png'
})
const load = document.getElementById('load')
const file = document.getElementById('file') as HTMLInputElement
file.accept = 'image/png'
file.addEventListener('change', function(){
    console.log(file.files[0])
    const img = new Image()
    img.onload = function(){
        mapCtx.drawImage(img, 0,0)
        mapCanvas.toBlob(function(blob){
            let url = URL.createObjectURL(blob)
            const downloader = document.getElementById('download') as HTMLAnchorElement
            downloader.href = url
            downloader.download = 'mapa.png'
        })
    }
    img.src = window.URL.createObjectURL(file.files[0])
    operations.addChangeLink(window.URL.createObjectURL(file.files[0]))
})
load.addEventListener('click',loadF)
function loadF(){
    document.getElementById('menu').style.display='none'
    file.click()
}
document.getElementById('undo').addEventListener('click', undo)
function undo(){
    document.getElementById('menu').style.display='none'
    console.log(operations.change)
    operations.arraycheck()
    if(operations.change>0){
        operations.change-=1
        const img = new Image()
        img.onload = function(){
            mapCtx.drawImage(img, 0,0)
            mapCanvas.toBlob(function(blob){
                let url = URL.createObjectURL(blob)
                const downloader = document.getElementById('download') as HTMLAnchorElement
                downloader.href = url
                downloader.download = 'mapa.png'
            })
        }
        img.src = operations.chngArray[operations.change]
    } else if(operations.change==0){
        operations.change-=1
        mapCtx.rect(0, 0, 736, 980)
        mapCtx.fillStyle = 'black'
        mapCtx.fill()
        mapCanvas.toBlob(function(blob){
            let url = URL.createObjectURL(blob)
            const downloader = document.getElementById('download') as HTMLAnchorElement
            downloader.href = url
            downloader.download = 'mapa.png'
        })
    }
}
document.getElementById('redo').addEventListener('click', redo)
function redo(){
    document.getElementById('menu').style.display='none'
    console.log('redo')
    operations.arraycheck()
    if(operations.change<operations.chngArray.length-1){
        operations.change+=1
        const img = new Image()
        img.onload = function(){
            mapCtx.drawImage(img, 0,0)
            mapCanvas.toBlob(function(blob){
                let url = URL.createObjectURL(blob)
                const downloader = document.getElementById('download') as HTMLAnchorElement
                downloader.href = url
                downloader.download = 'mapa.png'
            })
        }
        img.src = operations.chngArray[operations.change]
    }
}

const testCanvas = document.getElementById('testCanvas') as HTMLCanvasElement
testCanvas.id = 'testCanvas'
testCanvas.width = 736
testCanvas.height = 980
const testCtx = testCanvas.getContext('2d') as CanvasRenderingContext2D
let ready = false
document.getElementById('copy').addEventListener('click', copy)
function copy(){
    document.getElementById('menu').style.display='none'
    console.log('copy')
    if(operations.selected.length>0){
        let ids = [] as Array<Point>
        ready = true
        testCtx.clearRect(0, 0, testCanvas.width, testCanvas.height);
        const imgData = mapCanvas.toDataURL('image/png')
        const newImage = new Image
        const num = operations.selected.length
        const x = Math.min(...operations.selected.map(elem=>elem.x))
        const y = Math.min(...operations.selected.map(elem=>elem.y))
        const idX = (Math.min(...operations.selected.map(elem=>elem.x))-1)/49
        const idY = (Math.min(...operations.selected.map(elem=>elem.y))-1)/49
        const pom = operations.selected
        newImage.onload = ()=>{
            for(let i=0; i<num; i+=1){
                testCtx.drawImage(newImage,pom[i].x,pom[i].y,47,47,pom[i].x-x,pom[i].y-y,47,47)
                ids.push({x:(pom[i].x-1)/49-idX,y:(pom[i].y-1)/49-idY})
            }
            operations.ids = ids
        }
        newImage.src = imgData
        const selected = document.getElementsByClassName('selected') as HTMLCollectionOf<HTMLElement>
        Array.from(selected).forEach(function (element){
            element.className = 'mapItem'
            element.style.border = '1px solid white'
        })

        operations.selected=[]
    }
}
document.getElementById('cut').addEventListener('click',cut)
async function cut(){
    document.getElementById('menu').style.display='none'
    if(operations.selected.length>0){
        let ids=[] as Array<Point>
        ready = true
        testCtx.clearRect(0, 0, testCanvas.width, testCanvas.height);
        const imgData = mapCanvas.toDataURL('image/png')
        const newImage = new Image
        const num = operations.selected.length

        const x = Math.min(...operations.selected.map(elem=>elem.x))
        const y = Math.min(...operations.selected.map(elem=>elem.y))
        const idX = (Math.min(...operations.selected.map(elem=>elem.x))-1)/49
        const idY = (Math.min(...operations.selected.map(elem=>elem.y))-1)/49
        
        const img = await document.getElementById('sprite') as HTMLImageElement
        const pom = operations.selected
        newImage.onload = ()=>{
            for(let i=0; i<num; i+=1){
                testCtx.drawImage(newImage,pom[i].x,pom[i].y,47,47,pom[i].x-x,pom[i].y-y,47,47)
                mapCtx.drawImage(img,2,2,9,9,pom[i].x,pom[i].y,47,47)
                ids.push({x:(pom[i].x-1)/49-idX,y:(pom[i].y-1)/49-idY})
            }
            
            operations.addChange()
            operations.ids = ids
            
            mapCanvas.toBlob(function(blob){
                let url = URL.createObjectURL(blob)
                const downloader = document.getElementById('download') as HTMLAnchorElement
                downloader.href = url
                downloader.download = 'mapa.png'
            })
        }
        newImage.src = imgData
        const selected = document.getElementsByClassName('selected') as HTMLCollectionOf<HTMLElement>
        Array.from(selected).forEach(function (element){
            element.className = 'mapItem'
            element.style.border = '1px solid white'
        })
        operations.selected=[]
    }
}
document.getElementById('paste').addEventListener('click',function(){
    document.getElementById('menu').style.display='none'
    if(ready){
        operations.paste = true
        testCanvas.style.display='block'
        operations.painting= true
    }
})