importScripts('./ngsw-worker.js');

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-invoices') {
    // call method
    event.waitUntil(SyncInvoices());
  }
});

function addInvoices(data) {
  //indexDb

  //const base_url = 'http://127.0.0.1/epos';
  const base_url = 'apis';

  fetch(base_url + '/index.php/tasks/sale', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
    .then((r) => {
		Promise.resolve();
		console.log(r);


		})
    .catch(() => Promise.reject());
}

function SyncInvoices() {
  let db;
  const request = indexedDB.open('my-db');
  request.onerror = (event) => {
    console.log('Please allow my web app to use IndexedDB 😃>>>👻', error);
  };
  request.onsuccess = (event) => {
    db = event.target.result;
    getInvoices(db);
  };
}

function getInvoices(db) {
  const transaction = db.transaction(['invoices']);
  const objectStore = transaction.objectStore('invoices');
  const request = objectStore.getAll();
  request.onerror = (event) => {
    console.log(event);
  };
  request.onsuccess = (event) => {
    console.log( request.result);
	request.result.forEach(data =>{
		const invoice = JSON.parse(data);
		addInvoices(data);
	})
  };
}
