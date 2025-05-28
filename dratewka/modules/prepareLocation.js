import * as pageElem from "./class.js"

export function prepareLocation(position, location, inventory, item){
    pageElem.info.element.innerText=location[position]["info"]
    pageElem.img.element.src=`./img/${location[position]["img"]}`
    // img.src=`./img/${location[position]["img"]}`
    pageElem.img.element.style.backgroundColor=location[position]["color"]
    let dir = "You can go"
    if (location[position]["n"]){
        dir += " NORTH,"
        pageElem.north.element.style.display="none"
    } else {pageElem.north.element.style.display="block"}
    if (location[position]["e"]){
        dir += " EAST,"
        pageElem.east.element.style.display="none"
    } else {pageElem.east.element.style.display="block"}
    if (location[position]["s"]){
        dir += " SOUTH,"
        pageElem.south.element.style.display="none"
    } else {pageElem.south.element.style.display="block"}
    if (location[position]["w"]){
        dir += " WEST,"
        pageElem.west.element.style.display="none"
    } else {pageElem.west.element.style.display="block"}
    pageElem.directions.element.innerText =  dir.slice(0, -1)
    if (location[position]["items"].length==0){
        pageElem.items.element.innerText="You see nothing"
    } else {
        let info = "You see"
        for (let i=0; i<location[position]["items"].length; i+=1){
            info += ` ${item[location[position]["items"][i]].fullName},`
        }
        pageElem.items.element.innerText=info.slice(0, -1)
    }
    if (inventory.length == 0){
        pageElem.inv.element.innerText="You are carrying nothing"
    } else {
        let info = "You are carrying"
        for (let i=0; i<inventory.length; i+=1){
            info += ` ${item[inventory[i]].fullName},`
        }
        pageElem.inv.element.innerText=info.slice(0, -1)
    }
}