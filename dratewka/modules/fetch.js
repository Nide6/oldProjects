export async function jsonLoad(localization){
    const response = await fetch(localization)
    const data = await response.json()
    return data
}