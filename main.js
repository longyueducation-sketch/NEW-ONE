// Firebase config
var firebaseConfig = {
  apiKey: "AIzaSyAVRmYERGhzHRb4RLL-cWhukKRu-8mH9v4",
  authDomain: "daily-work-9609e.firebaseapp.com",
  projectId: "daily-work-9609e",
  storageBucket: "daily-work-9609e.appspot.com",
  messagingSenderId: "735676985753",
  appId: "1:735676985753:web:e311329c7475ac1364a308"
};

// 初始化 Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let currentUser = null;

// 登入
document.getElementById("login-btn").addEventListener("click", () => {
  var provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider).catch(err => alert(err.message));
});

// 登出
document.getElementById("logout-btn").addEventListener("click", () => {
  firebase.auth().signOut();
});

// 監聽登入狀態
firebase.auth().onAuthStateChanged(user => {
  if (user) {
    currentUser = user;
    document.getElementById("login-btn").style.display = "none";
    document.getElementById("logout-btn").style.display = "inline-block";
    loadTodos();
  } else {
    currentUser = null;
    document.getElementById("login-btn").style.display = "inline-block";
    document.getElementById("logout-btn").style.display = "none";
    document.getElementById("todo-list").innerHTML = "";
  }
});

// 新增代辦
document.getElementById("add-todo-btn").addEventListener("click", () => {
  const text = document.getElementById("todo-input").value.trim();
  if (text && currentUser) {
    db.collection("todos").add({
      uid: currentUser.uid,
      text: text,
      done: false,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    document.getElementById("todo-input").value = "";
  }
});

// 載入代辦
function loadTodos() {
  db.collection("todos")
    .where("uid", "==", currentUser.uid)
    .orderBy("createdAt", "asc")
    .onSnapshot(snapshot => {
      const todoList = document.getElementById("todo-list");
      todoList.innerHTML = "";
      snapshot.forEach(doc => {
        const todo = doc.data();
        const li = document.createElement("li");
        li.innerHTML = `
          <input type="checkbox" ${todo.done ? "checked" : ""}>
          <span style="text-decoration: ${todo.done ? "line-through" : "none"}">${todo.text}</span>
          <button class="delete-btn">刪除</button>
        `;
        li.querySelector("input").addEventListener("change", e => {
          db.collection("todos").doc(doc.id).update({
            done: e.target.checked
          });
        });
        li.querySelector(".delete-btn").addEventListener("click", () => {
          db.collection("todos").doc(doc.id).delete();
        });
        todoList.appendChild(li);
      });
    });
}
