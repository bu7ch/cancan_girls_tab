let children = JSON.parse(localStorage.getItem("children")) || [];
let rewards = JSON.parse(localStorage.getItem("rewards")) || [
  { name: "30 min dessin animé", cost: 10 },
  { name: "1 film", cost: 20 },
  { name: "Soirée pyjama", cost: 30 }
];

let quests = [
  { name: "Ranger la chambre", points: 15 },
  { name: "Nettoyer la table", points: 5 },
  { name: "Ranger le lave-vaisselle", points: 12 }
];

let currentAction = null; 
let currentValue = 0;

function saveData() {
  localStorage.setItem("children", JSON.stringify(children));
  localStorage.setItem("rewards", JSON.stringify(rewards));
}

function renderRewards() {
  const list = document.getElementById("rewardList");
  list.innerHTML = "";
  rewards.forEach((r, i) => {
    const li = document.createElement("li");
    li.innerHTML = `${r.name} (${r.cost} pts) 
      <button class="secondary" onclick="openChildPopup('reward', ${i})">🎁 Utiliser</button> 
      <button class="danger" onclick="deleteReward(${i})">❌</button>`;
    list.appendChild(li);
  });
}

function renderQuests() {
  const list = document.getElementById("questList");
  list.innerHTML = "";
  quests.forEach((q, i) => {
    const li = document.createElement("li");
    li.innerHTML = `${q.name} (+${q.points} pts) 
      <button class="success" onclick="openChildPopup('quest', ${i})">✅ Attribuer</button>`;
    list.appendChild(li);
  });
}

function render() {
  renderRewards();
  renderQuests();
  const list = document.getElementById("childrenList");
  list.innerHTML = "";
  children.forEach((child, index) => {
    const div = document.createElement("div");
    div.className = "child";
    div.innerHTML = `
      <h3>${child.name}</h3>
      <div class="chart-container">
        <canvas id="chart-${index}"></canvas>
      </div>
      <p class="points ${child.points < 0 ? 'negative' : ''}">Points: ${child.points}</p>
      <div class="btn-group">
        <button onclick="addPoint(${index})">+1</button>
        <button onclick="removePoint(${index})">-1</button>
        <button class="danger" onclick="deleteChild(${index})">❌ Supprimer</button>
      </div>
      <div class="history">
        <strong>Historique :</strong>
        <ul>
          ${child.history && child.history.length>0 ? child.history.map(h => `<li>${h}</li>`).join("") : "<li>Aucune récompense</li>"}
        </ul>
      </div>
    `;
    list.appendChild(div);

    const ctx = document.getElementById(`chart-${index}`).getContext("2d");
    let color = child.points < 0 ? "#e74c3c" : "#4CAF50";
    let positivePoints = Math.max(0, child.points);
    new Chart(ctx, {
      type: "doughnut",
      data: { datasets: [{ data: [positivePoints, Math.max(0,50-positivePoints)], backgroundColor:[color, "#ddd"] }] },
      options: { cutout:"75%", plugins:{ legend:{display:false}, tooltip:{enabled:false} } }
    });
  });
}

// Enfants
function addChild() { const name=document.getElementById("childName").value.trim(); if(name){ children.push({name,points:0,history:[]}); document.getElementById("childName").value=""; saveData(); render(); } }
function addPoint(i){ children[i].points++; saveData(); render(); }
function removePoint(i){ children[i].points--; saveData(); render(); }
function deleteChild(i){ if(confirm("Supprimer cet enfant ?")){ children.splice(i,1); saveData(); render(); } }

// Récompenses
function addReward(){ const name=document.getElementById("rewardName").value.trim(); const cost=parseInt(document.getElementById("rewardCost").value); if(name && cost>0){ rewards.push({name,cost}); document.getElementById("rewardName").value=""; document.getElementById("rewardCost").value=""; saveData(); render(); } }
function deleteReward(i){ if(confirm("Supprimer cette récompense ?")){ rewards.splice(i,1); saveData(); render(); } }
function resetPoints(){ if(confirm("Réinitialiser les points de tous les enfants (vendredi) ?")){ children = children.map(c=>({...c, points:0})); saveData(); render(); } }

// Popup tap-to-select
function openChildPopup(actionType, index){
  currentAction=actionType;
  currentValue=index;
  const popupList=document.getElementById("popupChildrenList");
  popupList.innerHTML="";
  children.forEach((c,i)=>{
    const btn=document.createElement("button");
    btn.textContent=`${c.name} (${c.points} pts)`;
    btn.onclick=()=>{ selectChild(i); };
    popupList.appendChild(btn);
  });
  document.getElementById("childPopup").style.display="flex";
}
function closePopup(){ document.getElementById("childPopup").style.display="none"; }

function selectChild(index){
  const child=children[index];
  if(currentAction==='quest'){
    const q=quests[currentValue];
    child.points+=q.points;
    const date=new Date().toLocaleDateString("fr-FR");
    child.history.push(`${date} → Quête: ${q.name} (+${q.points} pts)`);
  } else if(currentAction==='reward'){
    const r=rewards[currentValue];
    if(child.points>=r.cost){
      child.points-=r.cost;
      const date=new Date().toLocaleDateString("fr-FR");
      child.history.push(`${date} → Récompense: ${r.name}`);
      alert(`${child.name} a reçu ${r.name} 🎉`);
    } else alert(`${child.name} n'a pas assez de points 😅`);
  }
  saveData(); render(); closePopup();
}

render();
