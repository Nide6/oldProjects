interface Point {
    x:number
    y:number
}
/**
 * @param selected list of selected fields
 * @param change number of current changes
 */
class Operations {
    public selected:Array<Point>
    chngArray: Array<string>
    change: number
    canvas:HTMLCanvasElement
    ctx: CanvasRenderingContext2D
    paste: boolean
    ids: Array<Point>
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
    arraycheck(){
        console.log(this.chngArray)
    }
}

export default Operations