import {operations, moved} from "./index"

interface Point {
    x: number
    y: number
}

class MapItem {
    canvas: HTMLCanvasElement
    img: HTMLImageElement
    ctx: CanvasRenderingContext2D
    map: HTMLDivElement
    elem: HTMLDivElement
    x: number
    y: number

    constructor() {
        this.canvas = document.getElementById('mapCanvas') as HTMLCanvasElement
        this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D

        this.map = document.getElementById('map') as HTMLDivElement
        this.elem = document.createElement('div') as HTMLDivElement
        this.elem.style.position = 'absolute'
        this.elem.className = 'mapItem'
        this.elem.style.border = '1px solid white'
        this.elem.addEventListener('mousemove', function () {
            this.style.border = 'none'
            let testCanvas = document.getElementById('testCanvas') as HTMLCanvasElement
            testCanvas.style.top = this.style.top
            testCanvas.style.left = this.style.left
            if(operations.painting){
                console.log('painting')
                const reds = document.getElementsByClassName('mapItem') as HTMLCollectionOf<HTMLDivElement>
                for(let i=0;i<reds.length;i+=1){
                    reds[i].style.border='1px solid white'
                }
                for(let i=0; i<operations.ids.length;i+=1){
                    const elem = document.getElementById(`map:${operations.ids[i].x+Number(this.id.split(':')[1])}:${operations.ids[i].y+Number(this.id.split(':')[2])}`)
                    if(elem){
                        elem.style.border='1px solid red'
                    }
                }
            } else {
                console.log('dupa')
            }
        })
        this.elem.addEventListener('mouseleave', function () {
            if (this.className == 'mapItem') {
                this.style.border = '1px solid white'
            }
        })
        this.elem.addEventListener('click', (e) => {
            if(operations.paste){
                operations.paste = false
                let testCanvas = document.getElementById('testCanvas') as HTMLCanvasElement
                testCanvas.style.display = 'none'
                let newImage = new Image
                newImage.onload = ()=>{
                        this.ctx.drawImage(newImage,this.x,this.y)
                        operations.addChange()
                        this.canvas.toBlob(function(blob){
                            let url = URL.createObjectURL(blob)
                            const downloader = document.getElementById('download') as HTMLAnchorElement
                            downloader.href = url
                            downloader.download = 'mapa.png'
                        })
                        operations.painting=false
                        const selected = document.getElementsByClassName('mapItem') as HTMLCollectionOf<HTMLElement>
                        Array.from(selected).forEach(element => {
                            element.className = 'mapItem'
                            element.style.border = '1px solid white'
                        })
                }
                newImage.src = testCanvas.toDataURL('image/png')
            } else if(!moved){
                console.log('click')
                if (e.ctrlKey || e.metaKey) {
                    if(this.elem.classList.contains('selected')){
                        this.elem.className='mapItem'
                        this.elem.style.border = '1px solid white'
                        for(let i=0; i<operations.selected.length; i+=1){
                            if(operations.selected[i].x == this.x &&operations.selected[i].y == this.y){
                                operations.selected.splice(i, 1)
                            }
                        }
                    } else {   
                        operations.selected.push({ x: this.x, y: this.y })
                        this.elem.className = "selected"
                    }
                } else {
                    operations.selected = [{ x: this.x, y: this.y }]
                    const selected = document.getElementsByClassName('selected') as HTMLCollectionOf<HTMLElement>
                    Array.from(selected).forEach(element => {
                        element.className = 'mapItem'
                        element.style.border = '1px solid white'
                    })
                    this.elem.className = "selected"
            }
            console.log(Number(this.elem.id.split(':')[1]), Number(this.elem.id.split(':')[2]))
        }
        })
        this.map.appendChild(this.elem)
    }
    setPosition(point: Point) {
        this.elem.style.width = '24.2px'
        this.elem.style.height = '24.3px'
        this.elem.style.left = `${5.6 + point.x * 24 + point.x * 0.96}px`
        this.elem.style.top = `${43 + point.y * 24 + point.y * 0.96}px`
        this.elem.id = `map:${point.x}:${point.y}`
        this.x = 1 + 48 * point.x + point.x
        this.y = 1 + 48 * point.y + point.y
        console.log(this.x, this.y)
    }
    setImg(img: HTMLImageElement) {
        this.img = img
    }
}

export default MapItem