const topicsList = document.getElementById('topics-list');
const commandsList = document.getElementById('commands-list');
const commandsContainer = document.getElementById('commands-container');
const backBtn = document.getElementById('back-btn');
const themeToggle = document.getElementById('theme-toggle');
const searchInput = document.getElementById('search-input');
const heroDesc = document.getElementById('hero-desc');
const hero = document.getElementById('hero');

let currentCommands = [];
let darkMode = true;
let topics = []; 

async function fetchAPI() {
  try {
    const res = await fetch("https://www.devosalliance.com/api/kbase");
    return await res.json();
  } catch (err) {
    console.error("Erro ao buscar API:", err);
    return null;
  }
}

function transformData(data) {
  return Object.entries(data).map(([key, topic], index) => ({
    id: index + 1,
    name: key,
    icon: topic.icon,
    description: topic.descricao,
    commands: topic.comandos.map(cmd => ({
      name: cmd.comando,
      description: cmd.descricao,
      example: cmd.exemplo
    }))
  }));
}

function applyTheme() {
  if(darkMode) {
    document.body.classList.remove('bg-light','text-light-primary');
    document.body.classList.add('bg-dark','text-dark-primary');
    hero.classList.remove('card-light'); hero.classList.add('card-dark');
    heroDesc.classList.remove('text-secondary-light'); heroDesc.classList.add('text-secondary-dark');
    backBtn.classList.remove('btn-light'); backBtn.classList.add('btn-dark');
    searchInput.classList.remove('card-light','text-light-primary'); searchInput.classList.add('card-dark','text-dark-primary');
  } else {
    document.body.classList.remove('bg-dark','text-dark-primary');
    document.body.classList.add('bg-light','text-light-primary');
    hero.classList.remove('card-dark'); hero.classList.add('card-light');
    heroDesc.classList.remove('text-secondary-dark'); heroDesc.classList.add('text-secondary-light');
    backBtn.classList.remove('btn-dark'); backBtn.classList.add('btn-light');
    searchInput.classList.remove('card-dark','text-dark-primary'); searchInput.classList.add('card-light','text-light-primary');
  }
}

function toggleFade(showTopicsView) {
  if(showTopicsView) {
    commandsList.classList.replace('visible','hidden');
    topicsList.classList.replace('hidden','visible');
  } else {
    topicsList.classList.replace('visible','hidden');
    commandsList.classList.replace('hidden','visible');
  }
}

function showTopics() {
  topicsList.innerHTML = '';
  toggleFade(true);
  topics.forEach((topic, index) => {
    const topicDiv = document.createElement('div');
    topicDiv.className = `flex flex-col items-center text-center p-6 rounded-3xl shadow-2xl cursor-pointer hover:scale-105 hover:shadow-3xl transition transform fade-slide`;
    if(darkMode) topicDiv.classList.add('card-dark'); else topicDiv.classList.add('card-light');
    topicDiv.style.animationDelay = `${index*0.1}s`;
    topicDiv.innerHTML = `
      <img src="${topic.icon}" alt="${topic.name}" class="w-24 h-24 rounded-full border-2 border-[#800000] mb-4 topic-img"/>
      <h2 class="font-bold text-2xl mb-2 ${darkMode?'text-dark-primary':'text-light-primary'}">${topic.name}</h2>
      <p class="${darkMode?'text-secondary-dark':'text-secondary-light'} italic">${topic.description}</p>
    `;
    topicDiv.addEventListener('click', ()=>showCommands(topic));
    topicsList.appendChild(topicDiv);
  });
}

function showCommands(topic) {
  toggleFade(false);
  commandsContainer.innerHTML = '';
  searchInput.value = '';
  currentCommands = topic.commands;
  renderCommands(currentCommands);
}

function renderCommands(commands) {
  commandsContainer.innerHTML = '';
  commands.forEach((cmd,index)=>{
    const cmdDiv = document.createElement('div');
    cmdDiv.className = `flex flex-col gap-2 p-4 rounded-2xl shadow-lg hover:shadow-2xl transition fade-slide`;
    if(darkMode) cmdDiv.classList.add('card-dark'); else cmdDiv.classList.add('card-light');
    cmdDiv.style.animationDelay = `${index*0.05}s`;
    cmdDiv.innerHTML = `
      <pre class="font-bold ${darkMode?'text-dark-primary':'text-light-primary'} command-title">${cmd.name}</pre>
      <p class="text-sm italic ${darkMode?'text-secondary-dark':'text-secondary-light'}">${cmd.description}</p>
      ${cmd.example ? `<code class="block text-xs opacity-80">Ex: ${cmd.example}</code>` : ""}
      <button class="px-4 py-2 rounded-xl hover:brightness-110 transition ${darkMode?'btn-dark':'btn-light'}" onclick="copyCommand('${cmd.name}')">Copiar</button>
    `;
    commandsContainer.appendChild(cmdDiv);
  });
}

function copyCommand(command) {
  navigator.clipboard.writeText(command).then(()=>{ 
    alert(`Comando "${command}" copiado!`); 
  });
}


searchInput.addEventListener('input', ()=>{
  const query = searchInput.value.toLowerCase();
  const filtered = currentCommands.filter(cmd=> 
    cmd.name.toLowerCase().includes(query) || 
    cmd.description.toLowerCase().includes(query) ||
    (cmd.example && cmd.example.toLowerCase().includes(query))
  );
  renderCommands(filtered);
});

backBtn.addEventListener('click', showTopics);

themeToggle.addEventListener('click', ()=>{ 
  darkMode=!darkMode; 
  applyTheme(); 
  showTopics(); 
});

async function init() {
  const data = await fetchAPI();
  if (data) {
    topics = transformData(data);
    applyTheme();
    showTopics();
  } else {
    topicsList.innerHTML = "<p class='text-center text-red-500'>Não foi possível carregar os tópicos.</p>";
  }
}

init();
