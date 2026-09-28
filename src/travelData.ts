export const sources = {
  tdac: 'https://tdac.immigration.go.th/manual/en/faq.html',
  bus: 'https://airportpattayabus.com/airport-pattaya/',
  ferry: 'https://hellokohlarn.com/travel',
  palace: 'https://www.royalgrandpalace.th/en/visit/faq',
  help: 'https://th.china-embassy.gov.cn/zgqz/1w1/index_5.htm',
};

export type Stop = { time: string; title: string; detail: string; place?: string; tag?: string };
export type Day = { date: string; city: string; en: string; title: string; intro: string; sleep: string; stops: Stop[]; note: string };
export const days: Day[] = [
  { date: '04', city: '芭提雅', en: 'PATTAYA', title: '向海边出发', intro: '从机场到海边，把第一天留给木雕、日落和热闹的夜晚。', sleep: '芭提雅 · 酒店待确认', stops: [
    { time: '上午', title: '素万那普机场 → 芭提雅', detail: '前往机场 1 楼 8 号门购票，车程约 2 小时。先确认车票终点，再安排酒店接驳。', place: 'Suvarnabhumi Airport', tag: '跨城交通' },
    { time: '下午', title: '真理寺', detail: '看看海边的木雕建筑，给参观和拍照留出时间。入场安排以现场为准。', place: 'Sanctuary of Truth Pattaya' },
    { time: '傍晚', title: 'Terminal 21 → 海边日落', detail: '先逛航站楼主题商场、吃晚饭，再到海边散步。原笔记中的“粉红海滩”具体位置待确认。', place: 'Terminal 21 Pattaya' },
    { time: '晚上', title: '夜间演出，自由选择', detail: '蒂芙尼秀作为备选；原笔记也收录了 99 秀及风月步行街，具体场次与地点待确认。', place: "Tiffany's Show Pattaya", tag: '可选安排' },
  ], note: '原资料记录大巴 143 ฿、整点发车；当前运营方页面显示 135 ฿及固定班次，出发前以购票页面为准。' },
  { date: '05', city: '格兰岛', en: 'KOH LARN', title: '今天，只负责看海', intro: '坐轮渡去岛上，在热闹海滩与安静海湾之间，找到自己的节奏。', sleep: '芭提雅 · 当日往返', stops: [
    { time: '08:00 / 09:00', title: 'Bali Hai Pier → Tawaen Pier', detail: '两班为参考出发时间。轮渡参考 30 ฿ / 人 / 单程，航程约 40 分钟。先看当天返程公告。', place: 'Bali Hai Pier Pattaya', tag: '上岛轮渡' },
    { time: '上午', title: 'Tawaen Beach 玩水', detail: '主海滩比较热闹，可选拖曳伞、香蕉船、摩托艇和浮潜。原笔记四项 800 ฿是议价记录，不是固定套餐价。', place: 'Tawaen Beach Koh Larn' },
    { time: '中午 → 下午', title: '简单午餐，再去安静的海滩', detail: '便利店补给后，选 Tien Beach 拍照，或去 Tonglang Beach 休息。双条车价格和步行路线现场确认。', place: 'Tien Beach Koh Larn' },
    { time: '16:00 前后', title: '收拾心情，回芭提雅', detail: '建议提早回码头。参考表中 Tawaen 末班 17:00，Nabaan 末班 18:00，两个码头不能混用。', place: 'Tawaen Beach Pier', tag: '记住回程码头' },
  ], note: '海况会影响船班。原攻略“18:00 末班”对应的码头未写明，已按两处码头拆开；当天以码头公告为准。' },
  { date: '06', city: '回曼谷', en: 'BACK TO BANGKOK', title: '从海风，走进城市', intro: '上午留一点自由时间，午饭后退房，慢慢切换到曼谷的节奏。', sleep: '曼谷 · 酒店待确认', stops: [
    { time: '上午', title: '芭提雅自由活动', detail: '原资料列有黑水王射击、老虎园。可按兴趣选择，名称、门店与开放情况尚待确认，也可改为海边早餐。', tag: '可选安排' },
    { time: '午后', title: '退房 → 大巴返回曼谷', detail: '先确认曼谷下车站与酒店距离，给市区交通留出余量。返程车票、班次待预订。', place: 'Pattaya Bus Terminal' },
    { time: '傍晚', title: '入住曼谷，休息一下', detail: '办理入住、整理行李，看看第二天的步行与交通路线。晚餐优先选择酒店附近。' },
    { time: '晚上', title: '河畔散步，随体力决定', detail: '如果抵达较早，可以先去 ICONSIAM 看夜景。正式的河畔夜游放在 7 日，避免两晚重复赶路。', place: 'ICONSIAM Bangkok', tag: '弹性时间' },
  ], note: '两份攻略对 ICONSIAM 的日期安排不同：这里以攻略 2 为主，将夜游放在 7 日，6 日保留为备选。' },
  { date: '07', city: '曼谷', en: 'BANGKOK', title: '金色寺庙，与城市烟火', intro: '上午逛老城，午后去暹罗，晚餐与河畔夜景留一个舒服的取舍。', sleep: '曼谷 · 酒店待确认', stops: [
    { time: '上午', title: '大皇宫 + 玉佛寺', detail: '尽量早到，门票参考 500 ฿。提前查看开放公告与着装要求，给参观留足时间。', place: 'The Grand Palace Bangkok', tag: '老城漫游' },
    { time: '午后', title: '暹罗商圈', detail: 'Siam Paragon、Siam Center、Siam Discovery 按兴趣选择；天桥拍照、吃饭。四面佛为可选顺路点。', place: 'Siam Paragon Bangkok' },
    { time: '晚餐', title: '唐人街 / 朱拉美食街，二选一', detail: '唐人街吃街头小吃，或到朱拉隆功周边吃海鲜与妈妈面。想悠闲一点，就不把两处都塞进同一晚。', place: 'Banthat Thong Road Bangkok', tag: '留点胃口' },
    { time: '晚上', title: 'ICONSIAM 与湄南河夜景', detail: '在河畔收尾。游船需另查班次及是否含餐；如果晚餐排队太久，可只散步看夜景。', place: 'ICONSIAM Bangkok' },
  ], note: '这天内容较多，晚餐地点择一，四面佛和游船均为可选。大皇宫官网显示售票至 15:30，临时关闭另见公告。' },
  { date: '08', city: '返程', en: 'UNTIL NEXT TIME', title: '再吃一口，就说下次见', intro: '用一顿喜欢的早餐收尾，给机场和回家的路留足时间。', sleep: '回家 · 航班待确认', stops: [
    { time: '上午', title: '早餐、补买伴手礼', detail: '挑离酒店近的地方逛逛，芒果糯米饭、山竹冰，还有购物清单里没买到的小东西。' },
    { time: '退房前', title: '检查行李与证件', detail: '核对护照、手机、充电器和随身物品，确认退房时间、行李寄存及机场交通。' },
    { time: '按航班倒推', title: '出发前往机场', detail: '确认是 BKK 还是 DMK；建议国际航班提前约 3 小时到机场，再额外计入市区路程与堵车时间。', tag: '航班时间待补充' },
  ], note: '原资料没有航班、机场和具体时刻。这里只保留半日弹性安排，最终以机票与航空公司要求为准。' },
];

export const foodGroups = [
  { name: '朱拉周边', intro: '把晚餐留给海鲜、热汤和路边小店。', items: [
    ['松松海鲜', '咖喱炒蟹、咸蛋黄鱿鱼、烤河虾、山竹冰奶', 'Song Song Seafood Bangkok'],
    ['Here Hai', '蟹肉炒饭、皮皮虾盖饭、打抛扇贝；先核对门店', 'Here Hai Bangkok'],
    ['Elvis Suki', '黄油扇贝，原笔记计划吃完再去妈妈面', 'Elvis Suki Bangkok'],
    ['Jeh O Chula', '海鲜妈妈面；排队及线上取号规则现场确认', 'Jeh O Chula Bangkok'],
    ['牛奶小子', '留一站买牛奶；具体门店待确认', ''],
  ] },
  { name: '暹罗商圈', intro: '逛累了就坐下来，一次只选一家也很好。', items: [
    ['Nara Thai Cuisine', '蟹腿肉盖蛋、罗氏虾 · 笔记标注 Paragon G 层', 'Nara Thai Cuisine Siam Paragon'],
    ['Khao So-i', '泰北咖喱面 · 分店位置出发前核对', 'Khao So-i Bangkok'],
    ['Ros’Niyom', '打抛猪肉饭、泰式空心菜', 'Ros Niyom Siam Paragon'],
    ['Korata', '冬阴功火锅妈妈面 · 笔记标注 Siam Square Soi 3', 'Korata Bangkok'],
    ['Greyhound Cafe', '泰餐与西餐结合 · Siam Center', 'Greyhound Cafe Siam Center'],
    ['Babyccino & Co.', '咖啡休息站 · 笔记标注 Siam Discovery G 层', 'Babyccino Siam Discovery'],
  ] },
  { name: '芭提雅 & 海岛', intro: '轻松吃好，给玩水多留一点时间。', items: [
    ['Terminal 21 美食广场', '充值卡用餐；牛肉面、猪脚饭、空心菜。笔记楼层信息不一致，以现场导览为准。', 'Terminal 21 Pattaya'],
    ['7-Eleven 岛上午餐', '打抛饭、黑袋香肠、虾仁云吞、粉包装虾饺', '7-Eleven Koh Larn'],
    ['随手补给', '火鸡面饭团、热压三明治、汉堡、斑斓面包与吐司', ''],
    ['甜品愿望单', '芒果糯米饭、山竹冰，看到喜欢的小店就停一下', ''],
  ] },
];

export type Product = { id: string; name: string; en: string; type: string; price: string; note: string; sprite: number | null; sheet?: string; source: string };
export const products: Product[] = [
  { id: 'smooto', name: 'Smooto 番茄啫喱', en: 'TOMATO SOOTHING GEL', type: '护肤彩妆', price: '49 ฿', note: '粉色番茄图案小袋装，与 BB / CC 款分别收藏。', sprite: 0, source: '20260928142730' },
  { id: 'smooto-bbcc', name: 'Smooto BB / CC 霜', en: 'TOMATO BB + CC', type: '护肤彩妆', price: '39 ฿', note: '白红色番茄小袋装，色号与版本按实物核对。', sprite: 0, sheet: 'products-a', source: '20260928142730' },
  { id: 'garnier-mask', name: 'Garnier VC 面膜', en: 'VITAMIN C SERUM MASK', type: '护肤彩妆', price: '价格待看', note: '黄色独立片装面膜，原笔记的面膜收藏。', sprite: 1, sheet: 'products-a', source: '20260928142753' },
  { id: 'garnier-wash', name: 'Garnier VC 洗面奶', en: 'VITAMIN C FACE WASH', type: '护肤彩妆', price: '价格待看', note: '白色软管、黄色瓶盖；小样与正装容量不同。', sprite: 2, sheet: 'products-a', source: '20260928142753' },
  { id: 'garnier-micellar', name: 'Garnier VC 卸妆水', en: 'MICELLAR CLEANSING WATER', type: '护肤彩妆', price: '价格待看', note: '透明瓶身、黄色翻盖，与洗面奶分开列出。', sprite: 3, sheet: 'products-a', source: '20260928142753' },
  { id: 'garnier', name: 'Garnier VC 精华', en: 'VITAMIN C SERUM', type: '护肤彩妆', price: '价格待看', note: '银白色小袋装、橙色标签，选购时核对版本。', sprite: 1, source: '20260928142808' },
  { id: 'vitc-collagen', name: 'VC + 胶原蛋白精华', en: 'VITAMIN C & COLLAGEN', type: '护肤彩妆', price: '价格待看', note: '橙白色 2 in 1 小袋装；原图未清晰标明英文品牌。', sprite: 0, sheet: 'products-b', source: '20260928142808' },
  { id: 'clear-gel', name: 'Clear Nose 凝胶', en: 'ACNE CARE GEL', type: '护肤彩妆', price: '49 ฿', note: '绿色标签款，原笔记称祛痘凝胶；按包装说明使用。', sprite: 1, sheet: 'products-b', source: '20260928142808' },
  { id: 'clear-hya', name: 'Clear Nose HYA 精华', en: 'HYA SERUM', type: '护肤彩妆', price: '49 ฿', note: '紫色标签款，原笔记中的淡斑亮肤精华。', sprite: 2, sheet: 'products-b', source: '20260928142808' },
  { id: 'clear-sun', name: 'Clear Nose 防晒霜', en: 'UV SUNSCREEN', type: '护肤彩妆', price: '49 ฿', note: '蓝色标签款；防晒指数与使用方式以包装为准。', sprite: 3, sheet: 'products-b', source: '20260928142808' },
  { id: 'clear-vitc', name: 'Clear Nose VC 精华', en: 'VITAMIN C SERUM', type: '护肤彩妆', price: '49 ฿', note: '橙色标签款，与紫色 HYA 精华分别列出。', sprite: 4, sheet: 'products-b', source: '20260928142808' },
  { id: 'merrezca', name: 'Merrez’ca 粉底液', en: 'SKIN UP FOUNDATION', type: '护肤彩妆', price: '59 ฿', note: '小袋装方便携带，先确认适合自己的色号。', sprite: 2, source: '20260928142814' },
  { id: 'nivea', name: 'Nivea C&E 身体乳', en: 'C & E BODY LOTION', type: '日常补给', price: '24.8 ฿', note: '原笔记标注 Nivea VC+VE，白橙色软管装。', sprite: 4, sheet: 'products-a', source: '20260928142800' },
  { id: 'vaseline', name: 'Vaseline Gluta-Hya 身体乳', en: 'GLUTA-HYA BODY LOTION', type: '日常补给', price: '32 ฿', note: '蓝绿色软管、金色图案，核对容量后再购买。', sprite: 5, sheet: 'products-a', source: '20260928142800' },
  { id: 'dentiste', name: 'Dentiste 牙膏', en: 'DAILY FRESHNESS', type: '日常补给', price: '95 ฿', note: '绿色包装牙膏，容量与版本按实物核对。', sprite: 5, source: '20260928142814' },
  { id: 'rasyan', name: 'Rasyan 丁香牙膏', en: 'HERBAL CLOVE TOOTHPASTE', type: '日常补给', price: '价格待看', note: '粉绿盒装；原笔记称牙粉，包装写 Herbal Clove Toothpaste。', sprite: 5, sheet: 'products-b', source: '20260928142820' },
  { id: 'teeth-strips', name: '美白牙贴 · 品牌待定', en: 'ON THE WISHLIST', type: '日常补给', price: '价格待看', note: '原笔记只提到品类，没有品牌或配图；留在清单里到店确认。', sprite: null, source: '20260928142814' },
  { id: 'snake', name: '蛇牌清凉喷雾', en: 'SNAKE BRAND', type: '日常补给', price: '价格待看', note: '原笔记收藏经典款白色喷雾瓶。', sprite: 3, source: '20260928142820' },
  { id: 'soffell', name: 'Soffell 驱蚊喷雾', en: 'TRAVEL ESSENTIAL', type: '日常补给', price: '价格待看', note: '粉色喷头、绿色标签，小瓶装便于随身带。', sprite: 4, source: '20260928142827' },
  { id: 'tiger-cool', name: '虎牌贴布 · 清凉款', en: 'TIGER BALM COOL', type: '日常补给', price: '价格待看', note: '黄色包装、绿色横条，给妈妈的收藏之一。', sprite: 0, sheet: 'products-c', source: '20260928142827' },
  { id: 'tiger-warm', name: '虎牌贴布 · 温感款', en: 'TIGER BALM WARM', type: '日常补给', price: '价格待看', note: '黄色包装、红色横条；与清凉款区分，按说明选用。', sprite: 1, sheet: 'products-c', source: '20260928142827' },
  { id: 'herbal-balm', name: '卧佛青草膏', en: 'THAI HERBAL BALM', type: '日常补给', price: '价格待看', note: '绿色三瓶礼盒，给妈妈的收藏；具体规格看实物。', sprite: 2, sheet: 'products-c', source: '20260928142833' },
  { id: 'raben', name: 'RABEN 香皂', en: 'GINGER SOAP', type: '日常补给', price: '价格待看', note: '笔记写香茅皂，包装写 Ginger Soap，选购时核对。', sprite: 3, sheet: 'products-c', source: '20260928142833' },
  { id: 'bsc-shampoo', name: 'BSC Falless 洗发水', en: 'KAFFIR LIME SHAMPOO', type: '日常补给', price: '价格待看', note: '深绿色大泵瓶、青柠图案，与头皮护理液分开收藏。', sprite: 4, sheet: 'products-c', source: '20260928142838' },
  { id: 'bsc-tonic', name: 'BSC Falless 头皮护理液', en: 'KAFFIR LIME HAIR TONIC', type: '日常补给', price: '价格待看', note: '深绿色旋盖瓶，包装标注 Hair Tonic，按说明使用。', sprite: 5, sheet: 'products-c', source: '20260928142838' },
];

export const packing = [
  { name: '证件与入境', items: ['护照与身份证', 'TDAC 确认信息', '英文往返机票行程单', '英文酒店预订单', '银行卡与现金'] },
  { name: '海边随身包', items: ['泳衣与毛巾', '防晒用品与遮阳帽', '驱蚊液', '腰包与折叠拖鞋', '手机与充电设备'] },
  { name: '行李箱里', items: ['电话卡 / eSIM', '洗漱小样与花洒过滤器', '一次性内裤、浴巾、马桶垫', '吹风机（先问酒店）', '个人常备药'] },
];
