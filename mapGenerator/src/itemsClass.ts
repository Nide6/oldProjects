import {operations} from "./index"

/**
 * @interface Punkt no punkt jest punkt
 */
interface Punkt {
    x: number
    y: number
}
/**
 * @class Item to clasa odpowiadająca za item
 * @param canvas to jest canvas
 * @param img to jest grafika
 * @param ctx to jest takie gówno do renderowania
 * @param map to jest div o id map
 * @param elem to jest div przypisany do tej klasy
 * @param x to jest cyfra
 * @param y to jest cyfra
 * @param auto zakładam, że mercedes to to nie jest
 */
class Item {
    canvas: HTMLCanvasElement
    img: HTMLImageElement
    ctx: CanvasRenderingContext2D
    map: HTMLDivElement
    elem: HTMLDivElement
    x: number
    y: number
    auto:HTMLInputElement

    constructor() {
        this.auto = document.getElementById('auto') as HTMLInputElement
        this.canvas = document.getElementById('mapCanvas') as HTMLCanvasElement
        this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D
        this.map = document.getElementById('items') as HTMLDivElement
        this.elem = document.createElement('div') as HTMLDivElement
        this.elem.style.backgroundColor = 'black'
        this.elem.style.position = 'absolute'
        this.elem.style.opacity = '0.6'
        this.elem.className = 'item'
        this.elem.style.border = '1px solid white'
        this.elem.addEventListener('mouseenter', function () {
            this.style.background = 'none'
            this.style.border = 'none'
        })
        this.elem.addEventListener('mouseleave', function () {
            this.style.backgroundColor = 'black'
            this.style.border = '1px solid white'
        })
        this.elem.addEventListener('click', () => {
            console.log(operations.selected)
            for (let i = 0; i < operations.selected.length; i += 1) {
                this.ctx.drawImage(this.img, this.x, this.y, 47, 47, operations.selected[i].x, operations.selected[i].y, 47, 47)
            }
            const selected = document.getElementsByClassName('selected') as HTMLCollectionOf<HTMLElement>
            Array.from(selected).forEach(function (element){
                element.className = 'mapItem'
                element.style.border = '1px solid white'
            })
            let test = operations.selected[operations.selected.length-1]
            operations.selected = []
            if(test && this.auto.checked){

                let id = ''
                if((test.x-1)/49==14&&(test.y-1)/49==19){
                    id=`map:${(test.x-1)/49}:${(test.y-1)/49}`
                } else if((test.x-1)/49==14){
                    id=`map:0:${(test.y-1)/49+1}`
                } else {
                    id=`map:${(test.x-1)/49+1}:${(test.y-1)/49}`
                }
                console.log(id)
                document.getElementById(id).click()
                document.getElementById(id).style.border = 'none'
            }
            this.canvas.toBlob(function(blob){
                let url = URL.createObjectURL(blob)
                const downloader = document.getElementById('download') as HTMLAnchorElement
                downloader.href = url
                downloader.download = 'mapa.png'
            })
            operations.addChange()
        })
        this.map.appendChild(this.elem)
    }

    setPosition(punkt: Punkt) {
        this.elem.style.width = '24.2px'
        this.elem.style.height = '24.3px'
        this.elem.style.left = `${5.6 + punkt.x * 24 + punkt.x * 0.96}px`
        this.elem.style.top = `${43 + punkt.y * 24 + punkt.y * 0.96}px`
        this.elem.id = `item:${punkt.x}:${punkt.y}`
    }
    /**
     * @function setCanvasPosition czemu tego nie połączyć z setPosition(), nie wiem, chociaż wiem, bo mi sie nie chce
     * @param punkt punk to punkt ale nie taki na mapie
     */
    setCanvasPosition(punkt: Punkt) {
        this.x = punkt.x
        this.y = punkt.y
    }

    setImg(img: HTMLImageElement) {
        this.img = img
    }
}

export default Item