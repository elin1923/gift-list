// --- paste your firebaseConfig here ---
const firebaseConfig = {
  // your firebase config
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

async function addItem() {
  const name = document.getElementById("itemName").value;
  const link = document.getElementById("itemLink").value;
  const color = document.getElementById("itemColor").value;
  const size = document.getElementById("itemSize").value;
  const price = parseFloat(document.getElementById("itemPrice").value) || 0;
  const notes = document.getElementById("itemNotes").value;

  if (!name) return;

  await db.collection("items").add({
    name,
    link,
    color,
    size,
    price,
    notes,
    purchased: false,
    created: Date.now()
  });

  // clear fields
  ["itemName","itemLink","itemColor","itemSize","itemPrice","itemNotes"]
    .forEach(id => document.getElementById(id).value = "");
}

async function loadItems(guestMode) {
  const listEl = document.getElementById("itemList");

  db.collection("items")
    .orderBy("price", "asc")
    .onSnapshot(snapshot => {
      listEl.innerHTML = "";

      snapshot.forEach(doc => {
        const item = doc.data();
        const li = document.createElement("li");

        // Owner mode: hide purchased items entirely
        if (!guestMode && item.purchased) return;

        li.innerHTML = `
          <div class="item">
            <a href="${item.link}" target="_blank"><strong>${item.name}</strong></a>
            <div class="detail">Price: $${item.price.toFixed(2)}</div>
            ${item.color ? `<div class="detail">Color: ${item.color}</div>` : ""}
            ${item.size ? `<div class="detail">Size: ${item.size}</div>` : ""}
            ${item.notes ? `<div class="detail">Notes: ${item.notes}</div>` : ""}
            ${
              guestMode && !item.purchased
                ? `<button onclick="markPurchased('${doc.id}')">Mark as purchased</button>`
                : guestMode && item.purchased
                ? `<span class="done">Purchased</span>`
                : ""
            }
          </div>
        `;

        listEl.appendChild(li);
      });
    });
}

async function markPurchased(id) {
  await db.collection("items").doc(id).update({
    purchased: true
  });
}