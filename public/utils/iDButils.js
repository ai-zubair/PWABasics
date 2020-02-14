const iDBUtils = function(){
    function initializeDB(){
        return idb.openDB("feed-store",1,{
            upgrade(dbInstance,oldVersion,newVersion, transactionInstance){
                dbInstance.createObjectStore('posts',{
                    keyPath : 'id'
                })
            }
        });
    }
    
    async function addToDB(dataStore,responseData){
        const iDB = await initializeDB(); //open the connection to the iDB
        const dbTxn = iDB.transaction(dataStore,'readwrite'); //crete a transaction to interact with the iDB
        const postStore = dbTxn.objectStore(dataStore); //extract the store to interact with, using this transaction
        Object.values(responseData).forEach(async(response) => {
            await postStore.put(response); //wait for the operation request to succeed
        });
        await dbTxn.done;//wait for the transaction to complete
    }

    async function readFromDB(dataStore){
        const iDB = await initializeDB();
        const responseKeyRange = IDBKeyRange.lowerBound(1,false);
        const dataStoreResponse = await iDB.getAll(dataStore,responseKeyRange); //using the shortcut method here because we've a single-operation transaction
        return dataStoreResponse;
    }

    async function clearDBstore(dataStore){
        const iDB = await initializeDB();
        const dbTxn = iDB.transaction(dataStore,'readwrite');
        const dbStore = dbTxn.objectStore(dataStore);
        await dbStore.clear();
        await dbTxn.done;
    }

    async function cleanIfNotPresent(dataStore, responseData){
        const iDB = await initializeDB();
        const dbTxn = iDB.transaction(dataStore,'readwrite');
        const dbStore = dbTxn.objectStore(dataStore);
        const responseDataList = Object.values(responseData);
        const storeKeys = await dbStore.getAllKeys();
        storeKeys.forEach(async(key)=>{
            if(!responseDataList.find(dataItem => dataItem.id === key)){
                await dbStore.delete(key);
            }
        })
        await dbTxn.complete;
    }

    return {
        addToDB,
        readFromDB,
        clearDBstore,
        cleanIfNotPresent
    }
}();