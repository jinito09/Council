const MESSAGES = {
    ui: {
        title: 'COUNCIL IN DARKNESS',
        resources: 'RESOURCES:',
        daily_reports: 'DAILY REPORTS (Day {}):',
        actions: 'ACTIONS:'
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
        meeting_dismissed: '決断せずに会議を解散しました...', 
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
        rest: '明日まで休息します...', 
        resource_log_not_implemented: '資源ログの確認はまだ実装されていません。'
    },
    northern_coalition: {
        title: '=== 北部連合との接触 ===',
        weekly_demand: 'DAY {} - Weekly Demand',
        demand: 'THEIR DEMAND: "Submit {} {} units or face consequences"',
        hostility: 'HOSTILITY LEVEL: {}/100',
        your_capabilities: 'YOUR CAPABILITIES:',
        options: '対応オプション:',
        military_response: '[A] military response: "We\'ll defend ourselves!" ',
        diplomatic_response: '[B] diplomatic: "Perhaps we can reach an agreement?"',
        intelligence_response: '[C] intelligence: "We know about your supply issues"',
        comply_response: '[D] comply: "We\'ll provide what you ask"',
        prompt: '\nchoose response [A/B/C/D]: ',
        military_success: '軍事対応が成功しました！彼らは撤退しました。',
        military_failure: '軍事対応が失敗しました。彼らは攻撃してきました！',
        diplomatic_success: '外交交渉が成功しました。彼らは要求を撤回しました。',
        diplomatic_failure: '外交交渉が失敗しました。彼らは要求を強めてきました。',
        intelligence_success: '情報戦が成功しました。彼らは混乱し、要求を一時停止しました。',
        intelligence_failure: '情報戦が失敗しました。彼らはあなたの意図を察知しました。',
        comply_message: '要求された {} {} を提供しました。',
        invalid_choice: '無効な選択です。彼らはあなたの沈黙を敵対行為と見なしました。',
        continue_prompt: '\n[ENTER] to continue'
    }
};

function getMessage(category, key, ...args) {
    try {
        let message = MESSAGES[category][key];
        if (args.length > 0) {
            // Pythonの.format()のように{}を置換
            for (let i = 0; i < args.length; i++) {
                message = message.replace('{}', args[i]);
            }
        }
        return message;
    } catch (e) {
        return `[メッセージが見つかりません: ${category}.${key}]`;
    }
}

// 評議員の初期化関数
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
        // Pythonのrandom.choicesを模倣
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

// ゲームの状態
let gameState = {
    day: 1,
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
    player_actions: [],
    northern_coalition: {
        next_demand_day: 7,
        hostility_level: 30,
        recent_demands: [],
        last_response: null
    }
};

// 日報生成関数
function generateDailyReports(state) {
    const reports = [];

    for (const councillor of state.councillors) {
        const report = generateCouncillorReport(councillor, state);
        reports.push(`> ${councillor.name}: '${report}'`);
    }

    return reports;
}

// 個別の評議員報告を生成（嘘の可能性含む）
function generateCouncillorReport(councillor, state) {
    const role = councillor.role;
    const agenda = councillor.secret_agenda;

    // 基本的な報告内容
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

// UI表示関数
function getResourceStatus(value) {
    if (value >= 80) return "✓";
    else if (value >= 50) return "○";
    else if (value >= 20) return "△";
    else return "!";
}

function displayUi(state) {
    // Update day display
    if (typeof window.updateDayDisplay === 'function') {
        window.updateDayDisplay(state.day);
    }
    // Update resources display
    if (typeof window.updateResourcesDisplay === 'function') {
        window.updateResourcesDisplay(state.resources);
    }
    // Print reports to output div
    jsPrint(`\n${getMessage('ui', 'daily_reports', state.day)}`);
    const reports = generateDailyReports(state);
    for (const report of reports) {
        jsPrint(report);
    }
    jsPrint("- ".repeat(80)); // Separator
}

// Combined content of council.js
function identifyCurrentIssue(state) {
    const resources = state.resources;

    if (resources.food < 20) {
        return "食料不足が深刻 - 即座の対応が必要";
    } else if (resources.fuel < 30) {
        return "燃料備蓄が危険水準まで低下";
    } else if (resources.trust < 25) {
        return "評議会の結束が崩壊しつつあります";
    } else {
        return "全般的な資源配分の計画";
    }
}

function generateProposals(state, issue) {
    const proposals = {
        A: "配給を減らして備蓄を延ばします",
        B: "危険地帯に狩猟隊を派遣しましょう",
        C: "不要な人員を避難させます",
        D: "燃料と食料の物々交換を提案します",
        E: "軍事力強化：防衛力を高めます",
        F: "外交的働きかけ：外交力を高めます",
        G: "諜報活動：情報力を高めます"
    };
    return proposals;
}

function executeProposal(state, choice, proposals) {
    jsPrint(getMessage('proposal_execution', 'executed', proposals[choice]));
    if (choice === 'A') {
        state.resources.food += Math.floor(Math.random() * (10 - 5 + 1)) + 5;
        state.resources.trust -= 5;
    } else if (choice === 'B') {
        state.resources.food += Math.floor(Math.random() * (20 - 10 + 1)) + 10;
        state.resources.people -= Math.floor(Math.random() * (2 - 0 + 1)) + 0;
    } else if (choice === 'C') {
        state.resources.people -= Math.floor(Math.random() * (10 - 5 + 1)) + 5;
        state.resources.food += Math.floor(Math.random() * (10 - 5 + 1)) + 5;
    } else if (choice === 'D') {
        state.resources.fuel -= Math.floor(Math.random() * (10 - 5 + 1)) + 5;
        state.resources.food += Math.floor(Math.random() * (10 - 5 + 1)) + 5;
    } else if (choice === 'E') {
        state.resources.defense += Math.floor(Math.random() * (10 - 5 + 1)) + 5;
        state.resources.fuel -= Math.floor(Math.random() * (5 - 2 + 1)) + 2;
        state.resources.people -= Math.floor(Math.random() * (1 - 0 + 1)) + 0;
    } else if (choice === 'F') {
        state.resources.diplomacy += Math.floor(Math.random() * (10 - 5 + 1)) + 5;
        state.resources.food -= Math.floor(Math.random() * (5 - 2 + 1)) + 2;
    } else if (choice === 'G') {
        state.resources.intelligence += Math.floor(Math.random() * (10 - 5 + 1)) + 5;
        state.resources.people -= Math.floor(Math.random() * (1 - 0 + 1)) + 0;
        state.resources.trust -= Math.floor(Math.random() * (2 - 0 + 1)) + 0;
    }
    state.resources.trust += 5;
    jsPrint(getMessage('proposal_execution', 'not_implemented'));
}

async function holdCouncilMeeting(state) {
    jsPrint(getMessage('council', 'title'));

    const issue = identifyCurrentIssue(state);
    jsPrint(getMessage('council', 'issue', issue));

    const proposals = generateProposals(state, issue);

    jsPrint(`\n${getMessage('council', 'proposals')}`);
    let proposalKeys = Object.keys(proposals);
    for (let i = 0; i < proposalKeys.length; i++) {
        const key = proposalKeys[i];
        const proposal = proposals[key];
        const councillorName = state.councillors[i % state.councillors.length].name;
        jsPrint(`[${key}] ${councillorName}: "${proposal}" `);
    }

    jsPrint(`[X] ${getMessage('council', 'dismiss')}`);

    const choice = (await jsInput("\n提案を選択 [A/B/C/D/E/F/G/X]: ")).toUpperCase();

    if (choice === 'X') {
        state.resources.trust -= 5;
        jsPrint(getMessage('council', 'meeting_dismissed'));
    } else if (proposals[choice]) {
        executeProposal(state, choice, proposals);
    } else {
        jsPrint(getMessage('council', 'invalid_choice'));
        state.resources.trust -= 5;
    }
    displayUi(state); // Update UI after action
}

// Combined content of personal_envoy.js
function getActualSituation(state, investigationType) {
    const investigations = {
        A: "fuel貯蔵庫には47単位（報告の60ではない）\n> Fuel Managerが個人的な備蓄に回している形跡",
        B: "Food stores match reports, but quality is deteriorating\n> Food Coordinator hiding spoilage rates",
        C: "people数は正確だが、5人は家族関係者\n> Personnel Chiefが身内を優遇",
        D: "偵察報告はほぼ正確\n> 大きな欺瞞は検出されず"
    };
    return investigations[investigationType] || getMessage('actual_situations', 'default');
}

async function sendPersonalEnvoy(state) {
    if (state.resources.trust < 10) {
        jsPrint(getMessage('personal_envoy', 'trust_low'));
        return;
    }

    jsPrint(getMessage('personal_envoy', 'title'));
    jsPrint(`[A] ${getMessage('personal_envoy', 'investigate_fuel')}`);
    jsPrint(`[B] ${getMessage('personal_envoy', 'investigate_food')}`);
    jsPrint(`[C] ${getMessage('personal_envoy', 'investigate_people')}`);
    jsPrint(`[D] ${getMessage('personal_envoy', 'investigate_scout')}`);
    jsPrint(`[X] ${getMessage('personal_envoy', 'cancel')}`);

    const choice = (await jsInput(getMessage('personal_envoy', 'prompt'))).toUpperCase();

    if (['A', 'B', 'C', 'D'].includes(choice)) {
        const costTrust = 5;
        state.resources.trust -= costTrust;

        const truth = getActualSituation(state, choice);
        jsPrint(getMessage('personal_envoy', 'report_title'));
        jsPrint(getMessage('personal_envoy', 'cost', costTrust));
        jsPrint(getMessage('personal_envoy', 'result'));
        jsPrint(`> ${truth}`);

        await jsInput(getMessage('personal_envoy', 'continue_prompt'));
    } else if (choice === 'X') {
        jsPrint(getMessage('personal_envoy', 'cancelled'));
    } else {
        jsPrint(getMessage('personal_envoy', 'invalid_choice'));
    }
    displayUi(state); // Update UI after action
}

// Combined content of game_mechanics.js
// 敗北条件の詳細化
function checkDefeatConditions(state) {
    const resources = state.resources;

    if (resources.fuel <= 0) {
        return getMessage('defeat', 'fuel_zero');
    }
    if (resources.food <= 0) {
        return getMessage('defeat', 'food_zero');
    }
    if (resources.people <= 10) {
        return getMessage('defeat', 'people_low');
    }

    if (resources.trust <= 0) {
        return getMessage('defeat', 'trust_zero');
    }

    return null;
}

// 勝利条件の階層化
function checkVictoryConditions(state) {
    if (state.day > 30) {
        const resources = state.resources;
        const totalResources = Object.values(resources).reduce((sum, val) => sum + val, 0);

        if (
            resources.trust >= 70 &&
            resources.people >= 70 &&
            totalResources >= 300
        ) {
            return getMessage('victory', 'perfect');
        } else if (resources.trust >= 60) {
            return getMessage('victory', 'trust');
        } else if (totalResources >= 200) {
            return getMessage('victory', 'stable');
        } else {
            return getMessage('victory', 'survival');
        }
    }

    return null;
}

// リソース消費の可変化
function calculateDailyConsumption(state) {
    const people = state.resources.people;

    const baseFuel = Math.max(3, Math.floor(people / 8));
    const baseFood = Math.max(2, Math.floor(people / 10));

    return { fuel: baseFuel, food: baseFood };
}

// 外交システム
function diplomaticRoll(playerStat, enemyStat, difficulty = 50) {
    const playerRoll = Math.floor(Math.random() * 20) + 1 + playerStat;
    const enemyRoll = Math.floor(Math.random() * 20) + 1 + enemyStat + difficulty;
    return playerRoll >= enemyRoll;
}

// Combined content of northern_coalition.js
async function handleCoalitionDemand(state) {
    const coalition = state.northern_coalition;
    const resources = state.resources;

    jsPrint(getMessage('northern_coalition', 'title'));
    jsPrint(getMessage('northern_coalition', 'weekly_demand', state.day));

    const demandTypes = ['fuel', 'food', 'people'];
    const demandType = demandTypes[Math.floor(Math.random() * demandTypes.length)];
    const demandAmount = Math.floor(Math.random() * (30 - 10 + 1)) + 10;
    jsPrint(getMessage('northern_coalition', 'demand', demandAmount, demandType));
    jsPrint(getMessage('northern_coalition', 'hostility', coalition.hostility_level));

    jsPrint(getMessage('northern_coalition', 'your_capabilities'));
    for (const res of ['defense', 'diplomacy', 'intelligence']) {
        const value = resources[res];
        const barFilled = '*'.repeat(Math.floor(value / 5));
        const barEmpty = '-'.repeat(20 - Math.floor(value / 5));
        jsPrint(`${res.padEnd(12)} [${barFilled}${barEmpty}] ${String(value).padStart(3)}/100`);
    }

    jsPrint(getMessage('northern_coalition', 'options'));
    jsPrint(getMessage('northern_coalition', 'military_response'));
    jsPrint(getMessage('northern_coalition', 'diplomatic_response'));
    jsPrint(getMessage('northern_coalition', 'intelligence_response'));
    jsPrint(getMessage('northern_coalition', 'comply_response'));

    const choice = (await jsInput(getMessage('northern_coalition', 'prompt'))).toUpperCase();
    coalition.last_response = choice;

    if (choice === 'A') {
        if (diplomaticRoll(resources.defense, coalition.hostility_level, 0)) {
            jsPrint(getMessage('northern_coalition', 'military_success'));
            coalition.hostility_level = Math.max(0, coalition.hostility_level - (Math.floor(Math.random() * (20 - 10 + 1)) + 10));
            resources.trust += 5;
        } else {
            jsPrint(getMessage('northern_coalition', 'military_failure'));
            coalition.hostility_level = Math.min(100, coalition.hostility_level + (Math.floor(Math.random() * (20 - 10 + 1)) + 10));
            resources.people = Math.max(0, resources.people - (Math.floor(Math.random() * (5 - 1 + 1)) + 1));
            resources.fuel = Math.max(0, resources.fuel - (Math.floor(Math.random() * (10 - 5 + 1)) + 5));
            resources.trust -= 10;
        }
    } else if (choice === 'B') {
        if (diplomaticRoll(resources.diplomacy, coalition.hostility_level, 0)) {
            jsPrint(getMessage('northern_coalition', 'diplomatic_success'));
            coalition.hostility_level = Math.max(0, coalition.hostility_level - (Math.floor(Math.random() * (15 - 5 + 1)) + 5));
            resources.trust += 5;
        } else {
            jsPrint(getMessage('northern_coalition', 'diplomatic_failure'));
            coalition.hostility_level = Math.min(100, coalition.hostility_level + (Math.floor(Math.random() * (15 - 5 + 1)) + 5));
            resources.trust -= 5;
        }
    } else if (choice === 'C') {
        if (diplomaticRoll(resources.intelligence, coalition.hostility_level, 0)) {
            jsPrint(getMessage('northern_coalition', 'intelligence_success'));
            coalition.hostility_level = Math.max(0, coalition.hostility_level - (Math.floor(Math.random() * (15 - 5 + 1)) + 5));
            resources.trust += 5;
        } else {
            jsPrint(getMessage('northern_coalition', 'intelligence_failure'));
            coalition.hostility_level = Math.min(100, coalition.hostility_level + (Math.floor(Math.random() * (15 - 5 + 1)) + 5));
            resources.trust -= 5;
        }
    } else if (choice === 'D') {
        jsPrint(getMessage('northern_coalition', 'comply_message', demandAmount, demandType));
        resources[demandType] = Math.max(0, resources[demandType] - demandAmount);
        coalition.hostility_level = Math.max(0, coalition.hostility_level - (Math.floor(Math.random() * (20 - 10 + 1)) + 10));
        resources.trust -= 10;
    }

    await jsInput(getMessage('northern_coalition', 'continue_prompt'));
    displayUi(state); // Update UI after action
}

// Core game loop for a single day's processing
async function gameLoop() {
    displayUi(gameState); // Update UI at the start of the day

    if (gameState.day >= gameState.northern_coalition.next_demand_day) {
        await handleCoalitionDemand(gameState);
    }

    const defeatMessage = checkDefeatConditions(gameState);
    if (defeatMessage) {
        jsPrint(`\n${defeatMessage}`);
        // End game logic here
        return; // Stop gameLoop
    }

    const victoryMessage = checkVictoryConditions(gameState);
    if (victoryMessage) {
        jsPrint(`\n${victoryMessage}`);
        // End game logic here
        return; // Stop gameLoop
    }
}

// Global functions to be called by index.html buttons
window.startGame = async function() {
    // Initialize game state if needed (e.g., reset for new game)
    // For now, just start the first day
    await gameLoop(); // Start the first day
};

window.performCouncilAction = async function() {
    await holdCouncilMeeting(gameState);
};

window.performEnvoyAction = async function() {
    await sendPersonalEnvoy(gameState);
};

window.performResourcesAction = async function() {
    jsPrint(getMessage('game_loop', 'resource_log_not_implemented'));
    displayUi(gameState); // Update UI after action
};

window.performRestAction = async function() {
    jsPrint(getMessage('game_loop', 'rest'));
    gameState.day += 1;

    const { fuel, food } = calculateDailyConsumption(gameState);
    gameState.resources.fuel -= fuel;
    gameState.resources.food -= food;

    if (gameState.resources.fuel < 0) {
        gameState.resources.fuel = 0;
    }
    if (gameState.resources.food < 0) {
        gameState.resources.food = 0;
    }
    await gameLoop(); // Process the next day
};

// Initial UI update when the page loads (before game starts)
// This will display Day 1 and initial resources
if (typeof window.updateDayDisplay === 'function' && typeof window.updateResourcesDisplay === 'function') {
    window.updateDayDisplay(gameState.day);
    window.updateResourcesDisplay(gameState.resources);
}
