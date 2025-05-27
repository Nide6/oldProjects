
/**
 * @interface Punkt jet to punkt
 */
interface Punkt {
    x:number
    y:number
}
/**
 * @class Operations odpowiada za operacje i dane przekazywane między plikami
 * @param selected lista zaznaczonych pól
 * @param change numer zmiany
 * @param paste informacja czy wklejamy coś
 */
class Operations {
    public selected:Array<Punkt>
    chngArray: Array<string>
    change: number
    canvas:HTMLCanvasElement
    ctx: CanvasRenderingContext2D
    paste: boolean
    ids: Array<Punkt>
    painting: boolean
    
    constructor(){
        this.painting = false
        this.ids=[]
        this.paste = false
        this.selected=[]
        this.chngArray =[]
        this.change = -1
        this.canvas = document.getElementById('mapCanvas') as HTMLCanvasElement
        this.ctx =  this.canvas.getContext('2d')
    }
    
    addChange(){
        this.change+=1
        while(this.change<this.chngArray.length){
            this.chngArray.pop()
        }
        this.canvas.toBlob((blob)=>{
            let url = URL.createObjectURL(blob)
            this.chngArray.push(url)
        })
    }
    addChangeLink(link:string){
        this.change+=1
        while(this.change<this.chngArray.length){
            this.chngArray.pop()
        }
        this.chngArray.push(link)
    }
    /**
     * @function arraycheck takie gówno do sprawdzania zawartości tablicy
     */
    arraycheck(){
        console.log(this.chngArray)
    }
}

export default Operations