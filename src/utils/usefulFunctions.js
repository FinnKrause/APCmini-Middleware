export function compareMaps(map1, map2) {
    let testVal;
    if(map1.size !== map2.size) return false;

    for (let [key, value] of Object.entries(map1)) {
        testVal = map2.get(key);
        console.log(`Eval ${key}: ${value}==${testVal}`)
        if (!testVal || testVal != value) return false;
    }
    
    return true;
}