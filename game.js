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
        B: '食料貯蔵庫の量は報告通りだが、品質が劣化している\n> Food Coordinatorが腐敗率を隠蔽している',
        C: '人員数は正確だが、5人は評議員の家族関係者である\n> Personnel Chiefが身内を優遇している',
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
    let message = MESSAGES?.[category]?.[key];
    if (typeof message !== 'string') {
      return `[メッセージが見つかりません: ${category}.${key}]`;
    }
    for (const arg of args) {
      message = message.replace("{}", String(arg));
    }
    return message;
  } catch (_) {
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
  for (const c of councillors) {
    const total = weights.reduce((s,w)=>s+w,0);
    let r = Math.random() * total;
    let chosen = agendas; // This line is different from the previous patch
    for (let i = 0; i < agendas.length; i++) {
      r -= weights[i];
      if (r <= 0) { chosen = agendas[i]; break; }
    }
    c.secret_agenda = chosen;
    c.loyalty = Math.random() * (0.9 - 0.4) + 0.4;
    c.suspicion = 0;
  }
  return councillors;
}

function adjustCouncillorTrust(c, deltaSusp) {
  c.suspicion = Math.max(0, c.suspicion + deltaSusp);
}

function shouldDistort(c, baseP) {
  const p = Math.min(0.8, baseP + c.suspicion * 0.05); // suspicion 1 段階で +5%
  return Math.random() < p;
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
    rb.disabled = !(gameState.council_done || gameState.envoy_done);
  }
}

function startDaySimple(state) {
  // expire events
  if (state.events) state.events = state.events.filter(e => (--e.duration) > 0);

  // delayed envoy reports from previous day
  if (state.delayed_reports && state.delayed_reports.length > 0) {
    jsPrint("\n--- 前日に手配した偵察の遅延報告 ---");
    const prevReports = state.logs.reported[state.day - 1] || [];
    for (const act of state.delayed_reports) {
      const truth = getActualSituation(state, act.target);
      jsPrint(`偵察結果(${act.target}): ${truth}`);
      const roleMap = { A:'Fuel', B:'Food', C:'Personnel', D:'Scout' };
      const roleToFind = roleMap[act.target];
      const rep = prevReports.find(r => r.councillor.role.includes(roleToFind));
      if (rep) {
        if ((rep.type === 'fuel' || rep.type === 'food' || rep.type === 'people') && Math.abs(rep.actual - rep.reported) > 2) {
          adjustCouncillorTrust(rep.councillor, 5);
          jsPrint(` > ${rep.councillor.name}の報告には大きな乖離があった。疑念が上昇。`);
        }
        if (rep.type === 'scout' && rep.text === getMessage('reports','scout_hidden') && rep.actual !== rep.reported) {
          adjustCouncillorTrust(rep.councillor, 3);
          jsPrint(` > ${rep.councillor.name}は何かを隠していたようだ。疑念が上昇。`);
        }
      }
    }
    jsPrint("------------------------------------\n");
    state.delayed_reports = [];
  }

  state.council_done = false;
  state.envoy_done = false;
  state.action_queue = [];
  displayUi(state);
  updateActionButtons();
}

function generateDailyReports(state) {
  const reports = [];
  const reportObjects = [];
  for (const councillor of state.councillors) {
    const reportObj = generateCouncillorReport(councillor, state);
    reports.push(`> ${councillor.name}: '${reportObj.text}'`);
    reportObjects.push(reportObj);
  }
  state.logs.reported[state.day] = reportObjects; // Store the whole objects
  return reports; // Return only text for display
}

function generateCouncillorReport(councillor, state) {
    const role = councillor.role;
    const agenda = councillor.secret_agenda;
    let report = {
        councillor: councillor,
        text: "報告なし",
        actual: null,
        reported: null,
        type: ''
    };

    if (role.includes('Fuel')) {
        const actual = Math.floor(Math.random() * (15 - 8 + 1)) + 8;
        let reported = actual;
        let msgKey = 'fuel_normal';
        if (agenda === '権力欲' && shouldDistort(councillor, 0.3)) {
            reported = actual + Math.floor(Math.random() * (5 - 2 + 1)) + 2;
            msgKey = 'fuel_good';
        } else if (agenda === '工作員' && shouldDistort(councillor, 0.4)) {
            reported = actual - (Math.floor(Math.random() * (3 - 1 + 1)) + 1);
            msgKey = 'fuel_bad';
        }
        report.text = getMessage('reports', msgKey, reported);
        report.actual = actual;
        report.reported = reported;
        report.type = 'fuel';
    } else if (role.includes('Food')) {
        const actual = Math.floor(Math.random() * (12 - 5 + 1)) + 5;
        let reported = actual;
        let msgKey = 'food_normal';
        if (agenda === '生存主義' && shouldDistort(councillor, 0.3)) {
            reported = actual - (Math.floor(Math.random() * (3 - 1 + 1)) + 1);
            msgKey = 'food_bad';
        }
        report.text = getMessage('reports', msgKey, reported);
        report.actual = actual;
        report.reported = reported;
        report.type = 'food';
    } else if (role.includes('Personnel')) {
        const actual = Math.floor(Math.random() * 4); // 0..3
        let reported = actual;
        let msgKey = 'personnel_normal';
        if (agenda === '権力欲' && shouldDistort(councillor, 0.2)) {
            reported = actual + (Math.floor(Math.random() * 2) + 1);
            msgKey = 'personnel_good';
        }
        report.text = getMessage('reports', msgKey, reported);
        report.actual = actual;
        report.reported = reported;
        report.type = 'people';
    } else if (role.includes('Scout')) {
        const event_types = [
            { type: 'clear_skies', text: "快晴が続いています。", duration: 1, effect: null },
            { type: 'storm_incoming', text: "2日後に嵐が接近するでしょう。", duration: 3, effect: { type: 'fuel_consumption', modifier: 1.5 }, trigger_day: state.day + 2 },
            { type: 'tracks_found', text: "奇妙な痕跡が発見されました。", duration: 1, effect: null } // Later could trigger a specific choice
        ];
        const event = event_types[Math.floor(Math.random() * event_types.length)];
        state.events.push(event); // Add to game state

        let reported = event.text;
        let msgKey = 'scout_normal';
        if (agenda === '工作員' && shouldDistort(councillor, 0.3)) {
            reported = getMessage('reports', 'scout_hidden');
            msgKey = 'scout_hidden';
        }
        report.text = (msgKey === 'scout_hidden') ? reported : getMessage('reports', msgKey, reported);
        report.actual = event.text;
        report.reported = reported;
        report.type = 'scout';
    }
    return report;
}

function displayUi(state) {
  if (typeof window.updateDayDisplay === 'function') window.updateDayDisplay(state.day);
  if (typeof window.updateResourcesDisplay === 'function') window.updateResourcesDisplay(state.resources);
  jsPrint(`${getMessage('ui', 'daily_reports', state.day)}`);
  const stored = state.logs.reported[state.day];
  const lines = stored
    ? stored.map(o => `> ${o.councillor.name}: '${o.text}'`)
    : generateDailyReports(state);
  for (const line of lines) jsPrint(line);
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
  const dailyReports = state.logs.reported[state.day] || [];

  for (const act of envoys) {
    if (act.timing === 'LATER') {
        if (!state.delayed_reports) state.delayed_reports = [];
        state.delayed_reports.push(act);
        logs.push(` > 翌日報告の偵察を手配しました。`);
        continue;
    }

    const truth = getActualSituation(state, act.target);
    logs.push(`偵察結果(${act.target}): ${truth.split('\n')[0]}`);

    // Find the relevant councillor and report to check for discrepancies
    const investigationMap = { 'A': 'Fuel', 'B': 'Food', 'C': 'Personnel', 'D': 'Scout' };
    const roleToFind = investigationMap[act.target];
    const report = dailyReports.find(r => r.councillor.role.includes(roleToFind));

    if (report) {
        // A simple numeric comparison for resources
        if (report.type === 'fuel' || report.type === 'food' || report.type === 'people') {
            if (Math.abs(report.actual - report.reported) > 2) { // Allow for small variances
                adjustCouncillorTrust(report.councillor, 5); // Increase suspicion
                logs.push(` > ${report.councillor.name}の報告に大きな乖離を発見。疑念が上昇。`);
            }
        }
        // For scouts, check if the report was hidden
        if (report.type === 'scout' && report.text === getMessage('reports', 'scout_hidden')) {
             if (report.actual !== report.reported) {
                adjustCouncillorTrust(report.councillor, 3);
                logs.push(` > ${report.councillor.name}は何かを隠しているようだ。疑念が上昇。`);
             }
        }
    }
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

const PROPOSAL_RANGES = {
  A: { food: [5,10], trust: [-5,-5] },
  B: { food: [10,20], people: [0,-2] },
  C: { people: [-10,-5], food: [5,10] },
  D: { fuel: [-10,-5], food: [5,10] },
  E: { defense: [5,10], fuel: [-5,-2], people: [0,-1] },
  F: { diplomacy: [5,10], food: [-5,-2] },
  G: { intelligence: [5,10], people: [0,-1], trust: [0,-2] }
};
function formatRange(r){ const s=r[0], e=r[1]; return s===e? `${s}` : `${s}..${e}`; }
function previewProposal(key){
  const m = PROPOSAL_RANGES[key]; if(!m) return '';
  return Object.entries(m).map(([k,[a,b]])=>{
    const sign = (a>=0 && b>=0)? '+' : ''; return `${k}${sign}${formatRange([a,b])}`;
  }).join(', ');
}

function resolveProposalOperation(state, action) {
  const key = action.key;
  const effects = PROPOSAL_RANGES[key];
  if (!effects) return;

  for (const resource in effects) {
    const [min, max] = effects[resource];
    const change = randRange(min, max);
    state.resources[resource] += change;
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
  jsPrint('\n' + getMessage('council', 'proposals'));
  
  const choices = {};
  const proposalKeys = Object.keys(proposals);
  for (let i = 0; i < proposalKeys.length; i++) {
    const key = proposalKeys[i];
    const proposal = proposals[key];
    const councillorName = state.councillors[i % state.councillors.length].name;
    const preview = previewProposal(key); // Generate preview
    choices[key] = `[${key}] ${councillorName}: "${proposal}"\n    (期待効果: ${preview})`; // Add preview to choice
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
    const investigationMap = { 'A': 'Fuel', 'B': 'Food', 'C': 'Personnel', 'D': 'Scout' };
    const roleToFind = investigationMap[investigationType];
    const councillor = state.councillors.find(c => c.role.includes(roleToFind));
    if (!councillor) return getMessage('actual_situations', 'default');

    const agenda = councillor.secret_agenda;
    let truth = getMessage('actual_situations', 'default');

    // Low probability corruption events based on agenda
    if (investigationType === 'A' && (agenda === '権力欲' || agenda === '工作員') && Math.random() < 0.25) {
        truth = getMessage('actual_situations', 'A'); // Fuel embezzlement
        councillor.suspicion += 3; // Base suspicion increase for corruption
        state.resources.trust -= 2; // Small trust penalty
    } else if (investigationType === 'B' && (agenda === '生存主義' || agenda === '工作員') && Math.random() < 0.25) {
        truth = getMessage('actual_situations', 'B'); // Hiding spoilage
        councillor.suspicion += 3;
        state.resources.trust -= 2;
    } else if (investigationType === 'C' && agenda === '権力欲' && Math.random() < 0.25) {
        truth = getMessage('actual_situations', 'C'); // Nepotism
        councillor.suspicion += 3;
        state.resources.trust -= 2;
    } else if (investigationType === 'D') {
        truth = getMessage('actual_situations', 'D'); // Scout reports are mostly accurate
    }

    return truth;
}

function sendPersonalEnvoy(state) {
  if (state.resources.trust < 5) { // Minimum cost is now lower
    jsPrint(getMessage('personal_envoy', 'trust_low'));
    return;
  }
  jsPrint(getMessage('personal_envoy', 'title'));

  const choices = {
      'A_NOW': `[A] ${getMessage('personal_envoy', 'investigate_fuel')} (即時報告 - trust:10)`,
      'B_NOW': `[B] ${getMessage('personal_envoy', 'investigate_food')} (即時報告 - trust:10)`,
      'C_NOW': `[C] ${getMessage('personal_envoy', 'investigate_people')} (即時報告 - trust:10)`,
      'D_NOW': `[D] ${getMessage('personal_envoy', 'investigate_scout')} (即時報告 - trust:10)`,
      'A_LATER': `[A] ${getMessage('personal_envoy', 'investigate_fuel')} (翌日報告 - trust:5)`,
      'B_LATER': `[B] ${getMessage('personal_envoy', 'investigate_food')} (翌日報告 - trust:5)`,
      'C_LATER': `[C] ${getMessage('personal_envoy', 'investigate_people')} (翌日報告 - trust:5)`,
      'D_LATER': `[D] ${getMessage('personal_envoy', 'investigate_scout')} (翌日報告 - trust:5)`,
      'X': `[X] ${getMessage('personal_envoy', 'cancel')}`
  };

  window.displayChoices(choices, 'resolveEnvoyChoice');
  window.toggleActionButtons(false);
}

window.resolveEnvoyChoice = function(choice) {
    const state = gameState;
    if (choice === 'X') {
        jsPrint(getMessage('personal_envoy', 'cancelled'));
    } else {
        const [target, timing] = choice.split('_');
        const cost = (timing === 'NOW') ? 10 : 5;

        if (state.resources.trust < cost) {
            jsPrint(getMessage('personal_envoy', 'trust_low'));
        } else {
            state.resources.trust -= cost;
            state.action_queue.push({ type: 'envoy', target: target, timing: timing, cost: cost });
            jsPrint(getMessage('personal_envoy', 'report_title'));
            jsPrint(getMessage('personal_envoy', 'cost', cost));
            const reportTime = (timing === 'NOW') ? "本日の実行後（評定フェーズ）" : "明日";
            jsPrint(`結果は${reportTime}に開示されます。`);
        }
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

function checkIntermediateGoals(state) {
    const totalResources = Object.values(state.resources).reduce((sum, v) => sum + v, 0);
    let bonusMessage = "";

    if (state.day === 10) {
        jsPrint("\n--- 10日目 中間評価 ---");
        if (state.resources.trust >= 45 && totalResources >= 160) {
            bonusMessage = "評議会は安定しており、資源も順調です。住民の士気が高まりました。 (trust +5)";
            state.resources.trust += 5;
        } else if (state.resources.trust < 30) {
            bonusMessage = "評議会の信頼が大きく損なわれています。このままでは危険です...";
        } else {
            bonusMessage = "なんとか10日間を乗り切りました。しかし、まだ気は抜けません。";
        }
        jsPrint(bonusMessage);
        jsPrint("--------------------------\n");
    }

    if (state.day === 20) {
        jsPrint("\n--- 20日目 中間評価 ---");
        if (state.resources.trust >= 50 && totalResources >= 180) {
            bonusMessage = "優れたリーダーシップにより、避難所は磐石です。新たな展望が開けます。 (全資源 +3)";
            for (const r in state.resources) { state.resources[r] += 3; }
        } else if (state.resources.people < 50) {
            bonusMessage = "人員が危険な水準まで減少しています。避難所の維持が困難になってきました。";
        } else {
            bonusMessage = "20日が経過。終わりは近いですが、最も困難な時期かもしれません。";
        }
        jsPrint(bonusMessage);
        jsPrint("--------------------------\n");
    }
}

function checkVictoryConditions(state) {
  if (state.day > 30) {
    const { trust, people } = state.resources;
    const total = Object.values(state.resources).reduce((s, v) => s + v, 0);
    if (trust >= 70 && people >= 70 && total >= 300) return getMessage('victory','perfect');
    if (trust >= 60) return getMessage('victory','trust');
    if (total >= 200) return getMessage('victory','stable');
    return getMessage('victory','survival');
  }
  return null;
}

function calculateDailyConsumption(state) {
    const people = state.resources.people;
    let fuel_mod = 1.0;
    let food_mod = 1.0;

    if(state.events) {
        state.events.forEach(event => {
            if (event.trigger_day === state.day && event.effect) {
                if (event.effect.type === 'fuel_consumption') {
                    fuel_mod = event.effect.modifier;
                    jsPrint(`!!! イベント効果: 嵐により燃料消費が${fuel_mod}倍になります !!!`);
                }
            }
        });
    }

    const baseFuel = Math.max(3, Math.floor(people / 8));
    const baseFood = Math.max(2, Math.floor(people / 10));
    return { fuel: Math.floor(baseFuel * fuel_mod), food: Math.floor(baseFood * food_mod) };
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
  const d = gameState.day;
  const reported = gameState.logs.reported[d] || [];
  const actual = gameState.logs.actual[d] || [];
  const nextUse = calculateDailyConsumption(gameState);
  jsPrint(getMessage('ui','reported_summary'));
  reported.forEach(r => {
    if (typeof r === 'string') jsPrint(r);
    else jsPrint(`> ${r.councillor?.name ?? '?'}: '${r.text ?? r}'`);
  });
  jsPrint(getMessage('ui','ops_summary'));
  actual.forEach(a => jsPrint(typeof a === 'string' ? a : JSON.stringify(a)));
  jsPrint(`次日予測消費: fuel -${nextUse.fuel}, food -${nextUse.food}`);
};

window.performRestAction = function() {
  const opsLog = applyOperations(gameState);
  gameState.logs.actual[gameState.day] = (gameState.logs.actual[gameState.day] || []).concat(opsLog);

  const { fuel, food } = calculateDailyConsumption(gameState);
  gameState.resources.fuel = Math.max(0, gameState.resources.fuel - fuel);
  gameState.resources.food = Math.max(0, gameState.resources.food - food);

  checkIntermediateGoals(gameState);

  const defeatCondition = checkDefeatConditions(gameState);
  if (defeatCondition) {
    jsPrint(`\n${defeatCondition}`);
    window.toggleActionButtons(false);
    return;
  }

  const victoryCondition = checkVictoryConditions(gameState);
  if (victoryCondition) {
    jsPrint(`\n${victoryCondition}`);
    window.toggleActionButtons(false);
    return;
  }

  gameState.day++;
  startDaySimple(gameState);
};

