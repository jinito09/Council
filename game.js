const MESSAGES = {
  phases: {
    planning: '計画',
    operations: '実行',
    assessment: '評定'
  },
   ui: {
     title: 'COUNCIL IN DARKNESS',
     resources: 'RESOURCES:',
     daily_reports: 'DAILY REPORTS (Day {}):',
    actions: 'ACTIONS:',
    phase_label: 'PHASE: {}',
    ops_summary: '=== 本日の実行結果（事実ログ） ===',
    reported_summary: '=== 評議員の報告（報告ログ） ==='
   },
    actions: {
        1: '評議会を開催する',
        2: '個人偵察を派遣する',
        3: '資源記録を確認する',
        4: '明日まで休息する'
    },
    reports: {
        fuel_normal: '燃料生産は安定、{}単位を確保',
        fuel_good: '炭鉱の生産は絶好調です。本日{}単位を確保しました',
        fuel_bad: '設備にトラブルがあり、{}単位のみの生産でした',
        food_normal: '食料調達は成功、本日{}単位を獲得',
        food_bad: '狩猟隊が帰還、{}単位獲得。厳しい条件でした',
        personnel_normal: '本日、新規避難民{}名が到着',
        personnel_good: '新規避難民{}名が到着、士気は高いです',
        scout_normal: '{}',
        scout_hidden: '特に報告することはありません。異常なし'
    },
    council: {
        title: '=== 評議会開催 ===',
        issue: '問題: {}',
        proposals: '提案:',
        dismiss: '会議を解散する',
        meeting_dismissed: '決断せずに会議を解散しました... ',
        invalid_choice: '無効な選択です。会議は解散されました。'
    },
    proposal_execution: {
        executed: '提案 {}. を実行しました。',
        not_implemented: '（この提案による具体的な効果はまだ実装されていません）'
    },
    personal_envoy: {
        title: '=== 個人偵察の派遣 ===',
        trust_low: 'trustが低すぎます - 偵察を派遣する人員がいません',
        investigate_fuel: 'fuel供給状況を調査',
        investigate_food: 'food貯蔵庫を調査',
        investigate_people: 'people配置状況を調査',
        investigate_scout: '偵察活動を調査',
        cancel: 'キャンセル',
        prompt: '何を調査しますか [A/B/C/D/X]: ',
        report_title: '=== 偵察報告 ===',
        cost: 'コスト: 1日、trust {}',
        result: '\n調査結果:',
        continue_prompt: '\n[ENTER]で続行',
        cancelled: '偵察はキャンセルされました。',
        invalid_choice: '無効な選択です。偵察はキャンセルされました。'
    },
    actual_situations: {
        A: 'fuel貯蔵庫には47単位（報告の60ではない）\n> Fuel Managerが個人的な備蓄に回している形跡',
        B: 'Food stores match reports, but quality is deteriorating\n> Food Coordinator hiding spoilage rates',
        C: 'people数は正確だが、5人は家族関係者\n> Personnel Chiefが身内を優遇',
        D: '偵察報告はほぼ正確\n> 大きな欺瞞は検出されず',
        default: '特記すべき発見なし'
    },
    defeat: {
        fuel_zero: '【敗北】避難所が凍結しました。全員凍死。',
        food_zero: '【敗北】食料が尽きました。餓死者が続出。',
        people_low: '【敗北】人員が不足しすぎました。避難所維持不可能。',
        trust_zero: '【敗敗】評議会が反乱を起こしました。あなたは追放されました。'
    },
    victory: {
        perfect: '【完全勝利】理想的な避難所を構築しました！',
        trust: '【信頼勝利】住民の信頼を勝ち得ました。',
        stable: '【安定勝利】安定した避難所を維持しました。',
        survival: '【生存勝利】なんとか30日間生き延びました。'
    },
    game_loop: {
        invalid_action: '無効な行動です。',
        rest: '明日まで休息します... ',
        resource_log_not_implemented: '資源ログの確認はまだ実装されていません。'
    }
};

function getMessage(category, key, ...args) {
  try {
    let message = MESSAGES[category][key];
    if (typeof message !== 'string') {
      return `[メッセージが見つかりません: ${category}.${key}]`;
    }
    if (args.length > 0) {
      for (let i = 0; i < args.length; i++) {
        message = message.replace("{}", args[i]);
      }
    }
    return message;
  } catch (e) {
    return `[メッセージが見つかりません: ${category}.${key}]`;
  }
}

function initializeCouncillors() {
  const agendas = ['忠実', '権力欲', '生存主義', '工作員'];
  const weights = [60, 20, 15, 5];
  const councillors = [
    { name: 'Alex Chen', role: 'Fuel Manager' },
    { name: 'Maria Santos', role: 'Food Coordinator' },
    { name: 'David Kim', role: 'Personnel Chief' },
    { name: 'Sarah Johnson', role: 'Scout Leader' }
  ];
  for (const councillor of councillors) {
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let randomValue = Math.random() * totalWeight;
    let chosenAgenda = '';
    for (let i = 0; i < agendas.length; i++) {
      randomValue -= weights[i];
      if (randomValue <= 0) {
        chosenAgenda = agendas[i];
        break;
      }
    }
    councillor.secret_agenda = chosenAgenda;
    councillor.loyalty = Math.random() * (0.9 - 0.4) + 0.4;
    councillor.suspicion = 0;
  }
  return councillors;
}

let gameState = {
   day: 1,
  council_done: false,
  envoy_done: false,
  action_queue: [],
  logs: { reported: {}, actual: {} },
   resources: {
     fuel: 100,
     food: 100,
     people: 80,
     trust: 50,
     defense: 20,
     diplomacy: 30,
     intelligence: 10
   },
   councillors: initializeCouncillors(),
   events: [],
   player_actions: []
 };

function updateActionButtons() {
  const cb = document.getElementById('councilBtn');
  const eb = document.getElementById('envoyBtn');
  const rb = document.getElementById('restBtn');
  if (cb) cb.disabled = gameState.council_done;
  if (eb) eb.disabled = gameState.envoy_done;
  if (rb) {
    if (gameState.council_done || gameState.envoy_done) {
      rb.style.display = 'inline-block';
    } else {
      rb.style.display = 'none';
    }
  }
}

function startDaySimple(state) {
  state.council_done = false;
  state.envoy_done = false;
  state.action_queue = [];
  displayUi(state);
  updateActionButtons();
}

function generateDailyReports(state) {
  const reports = [];
  for (const councillor of state.councillors) {
    const report = generateCouncillorReport(councillor, state);
    reports.push(`> ${councillor.name}: '${report}'`);
  }
  state.logs.reported[state.day] = (state.logs.reported[state.day] || []).concat(reports);
  return reports;
}

function generateCouncillorReport(councillor, state) {
    const role = councillor.role;
    const agenda = councillor.secret_agenda;
    if (role.includes('Fuel')) {
        const actualProduction = Math.floor(Math.random() * (15 - 8 + 1)) + 8;
        if (agenda === '権力欲' && Math.random() < 0.3) {
            const reported = actualProduction + Math.floor(Math.random() * (5 - 2 + 1)) + 2;
            return getMessage('reports', 'fuel_good', reported);
        } else if (agenda === '工作員' && Math.random() < 0.4) {
            const reported = actualProduction - (Math.floor(Math.random() * (3 - 1 + 1)) + 1);
            return getMessage('reports', 'fuel_bad', reported);
        } else {
            return getMessage('reports', 'fuel_normal', actualProduction);
        }
    } else if (role.includes('Food')) {
        const actualGathering = Math.floor(Math.random() * (12 - 5 + 1)) + 5;
        if (agenda === '生存主義' && Math.random() < 0.3) {
            const reported = actualGathering - (Math.floor(Math.random() * (3 - 1 + 1)) + 1);
            return getMessage('reports', 'food_bad', reported);
        } else {
            return getMessage('reports', 'food_normal', actualGathering);
        }
    } else if (role.includes('Personnel')) {
        const newArrivals = Math.floor(Math.random() * (3 - 0 + 1)) + 0;
        if (agenda === '権力欲' && Math.random() < 0.2) {
            const reported = newArrivals + (Math.floor(Math.random() * (2 - 1 + 1)) + 1);
            return getMessage('reports', 'personnel_good', reported);
        } else {
            return getMessage('reports', 'personnel_normal', newArrivals);
        }
    } else if (role.includes('Scout')) {
        const events = ["clear skies", "storm coming in 2 days", "strange tracks found"];
        if (agenda === '工作員' && Math.random() < 0.3) {
            return getMessage('reports', 'scout_hidden');
        } else {
            return getMessage('reports', 'scout_normal', events[Math.floor(Math.random() * events.length)]);
        }
    }
    return "報告なし";
}

function displayUi(state) {
  if (typeof window.updateDayDisplay === 'function') {
    window.updateDayDisplay(state.day);
  }
  if (typeof window.updateResourcesDisplay === 'function') {
    window.updateResourcesDisplay(state.resources);
  }
  jsPrint(MESSAGES.ui.title + '<br>' + '-'.repeat(40));
  jsPrint(`${getMessage('ui', 'daily_reports', state.day)}`);
  const reports = state.logs.reported[state.day] || generateDailyReports(state);
  for (const report of reports) jsPrint(report);
  jsPrint("- ".repeat(40));
}

function applyOperations(state) {
  const logs = [];
  const proposals = state.action_queue.filter(a => a.type === 'proposal');
  for (const act of proposals) {
    const before = { ...state.resources };
    resolveProposalOperation(state, act);
    const delta = resourceDelta(before, state.resources);
    logs.push(`提案(${act.key})適用: ${delta}`);
  }
  const envoys = state.action_queue.filter(a => a.type === 'envoy');
  for (const act of envoys) {
    const truth = getActualSituation(state, act.target);
    logs.push(`偵察結果(${act.target}): ${truth.split('\n')[0]}`);
  }
  return logs;
}

function resourceDelta(before, after) {
  const keys = ['fuel','food','people','trust','defense','diplomacy','intelligence'];
  const parts = [];
  for (const k of keys) {
    const d = (after[k] ?? 0) - (before[k] ?? 0);
    if (d !== 0) parts.push(`${k}${d>0?'+':''}${d}`);
  }
  return parts.length ? parts.join(', ') : '変化なし';
}

function resolveProposalOperation(state, action) {
  const key = action.key;
  if (key === 'A') {
    state.resources.food += randRange(5,10);
    state.resources.trust -= 5;
  } else if (key === 'B') {
    state.resources.food += randRange(10,20);
    state.resources.people -= randRange(0,2);
  } else if (key === 'C') {
    state.resources.people -= randRange(5,10);
    state.resources.food += randRange(5,10);
  } else if (key === 'D') {
    state.resources.fuel -= randRange(5,10);
    state.resources.food += randRange(5,10);
  } else if (key === 'E') {
    state.resources.defense += randRange(5,10);
    state.resources.fuel -= randRange(2,5);
    state.resources.people -= randRange(0,1);
  } else if (key === 'F') {
    state.resources.diplomacy += randRange(5,10);
    state.resources.food -= randRange(2,5);
  } else if (key === 'G') {
    state.resources.intelligence += randRange(5,10);
    state.resources.people -= randRange(0,1);
    state.resources.trust -= randRange(0,2);
  }
}

function randRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function identifyCurrentIssue(state) {
    if (state.resources.food < 20) return "食料不足が深刻 - 即座の対応が必要";
    if (state.resources.fuel < 30) return "燃料備蓄が危険水準まで低下";
    if (state.resources.trust < 25) return "評議会の結束が崩壊しつつあります";
    return "全般的な資源配分の計画";
}

function generateProposals(state, issue) {
    return {
        A: "配給を減らして備蓄を延ばします",
        B: "危険地帯に狩猟隊を派遣しましょう",
        C: "不要な人員を避難させます",
        D: "燃料と食料の物々交換を提案します",
        E: "軍事力強化：防衛力を高めます",
        F: "外交的働きかけ：外交力を高めます",
        G: "諜報活動：情報力を高めます"
    };
}

function holdCouncilMeeting(state) {
  jsPrint(getMessage('council', 'title'));
  const issue = identifyCurrentIssue(state);
  jsPrint(getMessage('council', 'issue', issue));
  const proposals = generateProposals(state, issue);
  jsPrint('<br>' + getMessage('council', 'proposals'));
  
  const choices = {};
  const proposalKeys = Object.keys(proposals);
  for (let i = 0; i < proposalKeys.length; i++) {
    const key = proposalKeys[i];
    const proposal = proposals[key];
    const councillorName = state.councillors[i % state.councillors.length].name;
    choices[key] = `[${key}] ${councillorName}: "${proposal}"`;
  }
  choices['X'] = `[X] ${getMessage('council', 'dismiss')}`;

  window.displayChoices(choices, 'resolveCouncilChoice');
  window.toggleActionButtons(false);
}

window.resolveCouncilChoice = function(choice) {
    const state = gameState;
    if (choice === 'X') {
        state.resources.trust -= 5;
        jsPrint(getMessage('council', 'meeting_dismissed'));
    } else {
        state.action_queue.push({ type:'proposal', key: choice });
        jsPrint(`提案 ${choice} を本日の実行キューに追加しました。`);
    }
    
    window.clearChoices();
    window.toggleActionButtons(true);
    state.council_done = true;
    updateActionButtons();
}

function getActualSituation(state, investigationType) {
    const investigations = {
        A: "fuel貯蔵庫には47単位（報告の60ではない）\n> Fuel Managerが個人的な備蓄に回している形跡",
        B: "Food stores match reports, but quality is deteriorating\n> Food Coordinator hiding spoilage rates",
        C: "people数は正確だが、5人は家族関係者\n> Personnel Chiefが身内を優遇",
        D: "偵察報告はほぼ正確\n> 大きな欺瞞は検出されず"
    };
    return investigations[investigationType] || getMessage('actual_situations', 'default');
}

function sendPersonalEnvoy(state) {
  if (state.resources.trust < 10) {
    jsPrint(getMessage('personal_envoy', 'trust_low'));
    return;
  }
  jsPrint(getMessage('personal_envoy', 'title'));

  const choices = {
      A: `[A] ${getMessage('personal_envoy', 'investigate_fuel')}`,
      B: `[B] ${getMessage('personal_envoy', 'investigate_food')}`,
      C: `[C] ${getMessage('personal_envoy', 'investigate_people')}`,
      D: `[D] ${getMessage('personal_envoy', 'investigate_scout')}`,
      X: `[X] ${getMessage('personal_envoy', 'cancel')}`
  };

  window.displayChoices(choices, 'resolveEnvoyChoice');
  window.toggleActionButtons(false);
}

window.resolveEnvoyChoice = function(choice) {
    const state = gameState;
    if (['A', 'B', 'C', 'D'].includes(choice)) {
        const costTrust = 5;
        state.resources.trust -= costTrust;
        state.action_queue.push({ type:'envoy', target: choice, cost: costTrust });
        jsPrint(getMessage('personal_envoy', 'report_title'));
        jsPrint(getMessage('personal_envoy', 'cost', costTrust));
        jsPrint("結果は本日の実行後（評定フェーズ）に開示されます。");
    } else {
        jsPrint(getMessage('personal_envoy', 'cancelled'));
    }

    window.clearChoices();
    window.toggleActionButtons(true);
    state.envoy_done = true;
    updateActionButtons();
}

function checkDefeatConditions(state) {
    const resources = state.resources;
    if (resources.fuel <= 0) return getMessage('defeat', 'fuel_zero');
    if (resources.food <= 0) return getMessage('defeat', 'food_zero');
    if (resources.people <= 10) return getMessage('defeat', 'people_low');
    if (resources.trust <= 0) return getMessage('defeat', 'trust_zero');
    return null;
}

function checkVictoryConditions(state) {
    if (state.day > 30) {
        const { trust, people } = state.resources;
        const totalResources = Object.values(state.resources).reduce((sum, val) => sum + val, 0);
        if (trust >= 70 && people >= 70 && totalResources >= 300) return getMessage('victory', 'perfect');
        if (trust >= 60) return getMessage('victory', 'trust');
        if (totalResources >= 200) return getMessage('victory', 'stable');
        return getMessage('victory', 'survival');
    }
    return null;
}

function calculateDailyConsumption(state) {
    const people = state.resources.people;
    const baseFuel = Math.max(3, Math.floor(people / 8));
    const baseFood = Math.max(2, Math.floor(people / 10));
    return { fuel: baseFuel, food: baseFood };
}

window.startGame = function() {
  startDaySimple(gameState);
};

window.performCouncilAction = function() {
  if (gameState.council_done) return;
  holdCouncilMeeting(gameState);
};

window.performEnvoyAction = function() {
  if (gameState.envoy_done) return;
  sendPersonalEnvoy(gameState);
};

window.performResourcesAction = function() {
  jsPrint(getMessage('game_loop', 'resource_log_not_implemented'));
};

window.performRestAction = function() {
  const opsLog = applyOperations(gameState);
  gameState.logs.actual[gameState.day] = (gameState.logs.actual[gameState.day] || []).concat(opsLog);
  const { fuel, food } = calculateDailyConsumption(gameState);
  gameState.resources.fuel = Math.max(0, gameState.resources.fuel - fuel);
  gameState.resources.food = Math.max(0, gameState.resources.food - food);
  gameState.day++;
  startDaySimple(gameState);
};