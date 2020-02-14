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
        const idB = await initializeDB(); //open the connection to the iDB
        const dbTxn = idB.transaction(dataStore,'readwrite'); //crete a transaction to interact with the iDB
        const postStore = dbTxn.objectStore(dataStore); //extract the store to interact with, using this transaction
        Object.values(responseData).forEach(async(response) => {
            await postStore.put(response); //wait for the operation request to succeed
        });
        await dbTxn.done;//wait for the transaction to complete
    }

    async function readFromDB(dataStore){
        const idB = await initializeDB();
        const responseKeyRange = IDBKeyRange.lowerBound(1,false);
        const dataStoreResponse = await idB.getAll(dataStore,responseKeyRange); //using the shortcut method here because we've a single-operation transaction
        return dataStoreResponse;
    }
    return {
        addToDB,
        readFromDB
    }
}();