const PRICE=22000000, WA='66617142353';
const fmt=n=>new Intl.NumberFormat('en-US').format(Math.round(n));
function calc(){const r=+document.querySelector('#rent').value,e=+document.querySelector('#expenses').value,g=r*12,n=g-e;document.querySelector('#rentVal').textContent=fmt(r);document.querySelector('#expenseVal').textContent=fmt(e);document.querySelector('#gross').textContent=fmt(g)+' THB';document.querySelector('#costs').textContent='−'+fmt(e)+' THB';document.querySelector('#net').textContent=fmt(n)+' THB';document.querySelector('#grossYield').textContent=(g/PRICE*100).toFixed(1)+'%';document.querySelector('#netYield').textContent=(n/PRICE*100).toFixed(1)+'%';document.querySelector('#roi').textContent=(PRICE/n).toFixed(1)+' years'}

['rent','expenses'].forEach(id=>document.querySelector('#'+id).addEventListener('input',calc));calc();

const investmentSimulatorToggle=document.querySelector('#investmentSimulatorToggle');
const investmentSimulatorPanel=document.querySelector('#investmentSimulatorPanel');

investmentSimulatorToggle.addEventListener('click',()=>{
  const willOpen=investmentSimulatorPanel.hidden;
  investmentSimulatorPanel.hidden=!willOpen;
  investmentSimulatorToggle.setAttribute('aria-expanded',String(willOpen));
  if(willOpen){
    calc();
  }
});
const menu=document.querySelector('#menu'),hamb=document.querySelector('#hamb');hamb.addEventListener('click',()=>menu.classList.toggle('open'));document.addEventListener('keydown',e=>{if(e.key==='Escape')menu.classList.remove('open')});document.addEventListener('click',e=>{if(menu.classList.contains('open')&&!menu.contains(e.target)&&e.target!==hamb)menu.classList.remove('open')});menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>menu.classList.remove('open')));
const galleryPreviewReplacements=[
  {position:1,src:'assets/images/image-20-748c9482b2.webp',alt:'Villa Manon sala and pool terrace',galleryIndex:5},
  {position:2,src:'assets/images/image-22-06edf2089a.webp',alt:'Villa Manon living room facing the pool',galleryIndex:7},
  {position:3,src:'assets/images/image-23-f837eb1e2a.webp',alt:'Villa Manon open-plan living room and kitchen',galleryIndex:8}
];
const galleryPreviewImages=[...document.querySelectorAll('.gallery-grid img')];
galleryPreviewReplacements.forEach(({position,src,alt,galleryIndex})=>{
  const image=galleryPreviewImages[position];
  if(!image) return;
  image.src=src;
  image.alt=alt;
  image.dataset.galleryIndex=galleryIndex;
});
const bedroomGallery=document.querySelector('#bedroomGallery');
const galleryTrack=document.querySelector('#galleryTrack');
const galleryCurrent=document.querySelector('#galleryCurrent');
const galleryTotal=document.querySelector('#galleryTotal');
const galleryDots=[...document.querySelectorAll('.gallery-modal__dot')];
const gallerySlides=[...document.querySelectorAll('.gallery-modal__slide')];
galleryTotal.textContent=gallerySlides.length;
let galleryIndex=0, galleryStartX=0, galleryDeltaX=0, galleryDragging=false;
function renderGallery(animate=true){
  galleryTrack.style.transition=animate?'transform .34s cubic-bezier(.22,.61,.36,1)':'none';
  galleryTrack.style.transform=`translate3d(${-galleryIndex*100}%,0,0)`;
  galleryCurrent.textContent=galleryIndex+1;
  galleryDots.forEach((d,i)=>d.classList.toggle('active',i===galleryIndex));
}
function openGallery(index=0){
  galleryIndex=Math.max(0,Math.min(gallerySlides.length-1,index));
  bedroomGallery.classList.add('open');document.body.classList.add('gallery-open');
  renderGallery(false);document.querySelector('#galleryClose').focus();
}
function closeGallery(){bedroomGallery.classList.remove('open');document.body.classList.remove('gallery-open')}
function stepGallery(step){galleryIndex=(galleryIndex+step+gallerySlides.length)%gallerySlides.length;renderGallery()}
document.querySelectorAll('[data-gallery-index]').forEach(el=>{
  if(el.classList.contains('gallery-modal__dot')) return;
  el.addEventListener('click',()=>openGallery(Number(el.dataset.galleryIndex)||0));
});
document.querySelectorAll('[data-open-gallery]').forEach(el=>el.addEventListener('click',e=>{
  const forcedStart=el.dataset.galleryStart;
  if(forcedStart!==undefined){
    openGallery(Number(forcedStart)||0);
    return;
  }
  const img=e.target.closest('img');
  const idx=img&&img.dataset.galleryIndex!==undefined
    ? Number(img.dataset.galleryIndex)
    : (img?[...document.querySelectorAll('.gallery-grid img')].indexOf(img):0);
  openGallery(Math.max(0,idx));
}));
document.querySelector('#galleryClose').addEventListener('click',closeGallery);
const galleryPrev=document.querySelector('#galleryPrev');
const galleryNext=document.querySelector('#galleryNext');

function handleGalleryNav(event,step){
  event.preventDefault();
  event.stopPropagation();
  galleryDragging=false;
  galleryDeltaX=0;
  stepGallery(step);
}

['pointerdown','mousedown','touchstart'].forEach(eventName=>{
  galleryPrev.addEventListener(eventName,e=>e.stopPropagation(),{passive:true});
  galleryNext.addEventListener(eventName,e=>e.stopPropagation(),{passive:true});
});

galleryPrev.addEventListener('click',e=>handleGalleryNav(e,-1));
galleryNext.addEventListener('click',e=>handleGalleryNav(e,1));
galleryDots.forEach(d=>d.addEventListener('click',()=>{galleryIndex=+d.dataset.galleryIndex;renderGallery()}));
bedroomGallery.addEventListener('click',e=>{if(e.target===bedroomGallery)closeGallery()});
document.addEventListener('keydown',e=>{
  if(!bedroomGallery.classList.contains('open'))return;
  if(e.key==='Escape')closeGallery();
  if(e.key==='ArrowLeft')stepGallery(-1);
  if(e.key==='ArrowRight')stepGallery(1);
});
const galleryViewport=document.querySelector('#galleryViewport');
galleryViewport.addEventListener('pointerdown',e=>{
  if(e.target.closest('.gallery-modal__nav,.gallery-modal__close,.gallery-modal__dot')) return;
  if(e.pointerType==='mouse'&&e.button!==0)return;
  galleryDragging=true;
  galleryStartX=e.clientX;
  galleryDeltaX=0;
  galleryTrack.style.transition='none';
  galleryViewport.setPointerCapture?.(e.pointerId);
});
galleryViewport.addEventListener('pointermove',e=>{if(!galleryDragging)return;galleryDeltaX=e.clientX-galleryStartX;const px=-galleryIndex*galleryViewport.clientWidth+galleryDeltaX;galleryTrack.style.transform=`translate3d(${px}px,0,0)`});
function finishSwipe(){if(!galleryDragging)return;galleryDragging=false;const threshold=Math.min(90,galleryViewport.clientWidth*.18);if(Math.abs(galleryDeltaX)>threshold)stepGallery(galleryDeltaX<0?1:-1);else renderGallery();galleryDeltaX=0}
galleryViewport.addEventListener('pointerup',finishSwipe);galleryViewport.addEventListener('pointercancel',finishSwipe);

const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('show')}),{threshold:.12});document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
const t={
en:{rentMin:'50,000',rentMax:'600,000',
navHome:'Home',navVilla:'The villa',navGallery:'Gallery',navFeatures:'Features',navPlan:'Plan',navLocation:'Location',navInvestment:'Investment',
waViewing:'Request a viewing',heroDiscover:'Discover the villa',newVilla:'Villa for sale in Rawai, Phuket',
heroTitle:'VILLA FOR SALE<br>IN PHUKET',
heroText:'Discover Villa Manon, a modern tropical villa for sale in Phuket with four bedrooms, a private pool and a prime location in Rawai.',
bedrooms:'Bedrooms',bathrooms:'Bathrooms',privatePool:'Private<br>pool',landSize:'Land size',
verifiedTitle:'Compliance',verifiedText:'Documents prepared in accordance with Thai legislation.',
transparentTitle:'Availability',transparentText:'Villa currently available for sale.',
fastTitle:'Fast response',fastText:'Quick answers to your questions and viewing requests.',
assistTitle:'Assistance',assistText:'Personalised support throughout the acquisition process.',
whyTitle:'What makes Villa Manon unique',
why1:'A sought-after location in Rawai, combining peace, beaches, restaurants and everyday amenities',
why2:'Bright, flowing spaces designed for a natural indoor-outdoor lifestyle',
why3:'A private pool, terrace and garden designed to make the most of the tropical climate',
why4:'Four bedrooms and five bathrooms offering comfort and privacy for family and guests',
why5:'A fully furnished villa, ready to enjoy from day one',
featuresTitle:'Main features',featuresCatContract:'Property information',featuresCatVilla:'The villa',featuresCatEquipment:'Equipment',galleryTitle:'Photo gallery',floorTitle:'Villa floor plan',
floorExploreTitle:'Explore the layout of Villa Manon',
floorExploreText:'Switch between the architectural plan and the premium 3D representation. Tap a marker to discover each area.',
blueprint:'Architectural plan',design3d:'3D design',privatePoolText:'Private pool',livingArea:'Living area',
seePhotos:'View photos',fullscreen:'Full screen',
planHint:'Tap the markers • Pinch or double-tap in full screen to zoom',
dayTitle:'A day at Villa Manon',livingTitle:'Living in Rawai',
locationTitle:'Location and distances',livingLocationTitle:'Living in Rawai',
livingLocationText:'Villa Manon enjoys a privileged location in Rawai, close to beaches, local markets, restaurants, marinas and Phuket’s iconic viewpoints. Everything needed for a practical tropical lifestyle is only a few minutes away.',
simTitle:'Investment simulator',simText:'Estimate your potential rental income and return on investment in Rawai.',
sim1:'Adjustable parameters',sim2:'Local market data',sim3:'Realistic scenario',sim4:'Clear results',
monthlyIncome:'Estimated monthly rental income',annualExpenses:'Estimated annual expenses',
resultsTitle:'Estimated results (realistic scenario)',grossAnnual:'Gross annual income',grossYield:'Gross yield : ',
annualCosts:'Annual expenses',netAnnual:'Net annual income',netYield:'Net yield : ',roi:'Return on investment',
simNote:'Indicative results based on the assumptions entered by the user and current market conditions.',
propertyInfo:'Property information',whyPrice:'What gives Villa Manon its value',
readyTitle:'Ready to take the next step?',
readyText:'Villa Manon is ready to welcome you. Contact us to request a private viewing or receive more information.',
contactTitle:'Your contact for Villa Manon',ownerLabel:'Owner',
ownerText:'Feel free to contact me for more information or to arrange a private viewing.',
directTitle:'Contact me directly',
scan:'Scan the QR code or <a href="https://wa.me/66617142353" target="_blank" rel="noopener">click here</a> to start the conversation.',
messageTitle:'Send me a message',name:'Your name',email:'Email',phone:'Phone / WhatsApp',message:'Your message',
preferredDate:'',sendEmail:'Send by email',viewAll:'View all 29 photos ↗',
morning:'Morning',morningText:'Start the day with a coffee by the pool.',
afternoon:'Afternoon',afternoonText:'Enjoy the open-plan living area or the terrace.',
evening:'Evening',eveningText:'Discover Rawai’s best restaurants.',
night:'Night',nightText:'Relax in a peaceful and secure villa.'
},
fr:{rentMin:'50 000',rentMax:'600 000',
navHome:'Accueil',navVilla:'La villa',navGallery:'Galerie',navFeatures:'Caractéristiques',navPlan:'Plan',navLocation:'Location',navInvestment:'Investissement',
waViewing:'Demander une visite',heroDiscover:'Découvrir la villa',newVilla:'Nouvelle villa à Rawai',
heroTitle:'VOTRE NOUVELLE<br>VIE À RAWAI',
heroText:'Une villa tropicale moderne conçue pour le confort, l’intimité et la détente, à quelques minutes des plus belles plages de Phuket.',
bedrooms:'Chambres',bathrooms:'Salles de bains',privatePool:'Piscine<br>privée',landSize:'Terrain',
verifiedTitle:'Conformité',verifiedText:'Documents préparés conformément à la législation thaïlandaise.',
transparentTitle:'Disponibilité',transparentText:'Villa actuellement disponible à la vente.',
fastTitle:'Réponse rapide',fastText:'Réponse rapide à vos questions et demandes de visite.',
assistTitle:'Accompagnement',assistText:'Assistance personnalisée tout au long du processus d’acquisition.',
whyTitle:'Ce qui rend Villa Manon unique',
why1:'Un emplacement recherché à Rawai, entre calme, plages, restaurants et commodités',
why2:'Des espaces lumineux et fluides, pensés pour une vie intérieure-extérieure naturelle',
why3:'Une piscine privée, une terrasse et un jardin conçus pour profiter pleinement du climat tropical',
why4:'Quatre chambres et quatre salles de bains offrant confort et intimité à la famille comme aux invités',
why5:'Une villa entièrement meublée et prête à vivre dès le premier jour',
featuresTitle:'Caractéristiques principales',featuresCatContract:'Informations du bien',featuresCatVilla:'La villa',featuresCatEquipment:'Équipements',galleryTitle:'Galerie photos',floorTitle:'Plan de la villa',
floorExploreTitle:'Découvrez l’agencement de Villa Manon',
floorExploreText:'Passez du plan architectural à la représentation 3D premium. Touchez un repère pour découvrir chaque espace.',
blueprint:'Plan architectural',design3d:'Design 3D',privatePoolText:'Piscine privée',livingArea:'Surface habitable',
seePhotos:'Voir les photos',fullscreen:'Plein écran',
planHint:'Touchez les repères • Pincez ou double-touchez en plein écran pour zoomer',
dayTitle:'Une journée à Villa Manon',livingTitle:'Vivre à Rawai',
locationTitle:'Localisation et distances',livingLocationTitle:'Vivre à Rawai',
livingLocationText:'Villa Manon bénéficie d’un emplacement privilégié à Rawai, à proximité des plages, marchés locaux, restaurants, marinas et points de vue emblématiques de Phuket. Tout ce qui compose un art de vivre tropical et pratique se trouve à seulement quelques minutes.',
simTitle:'Simulateur d’investissement',simText:'Estimez votre revenu locatif potentiel et le retour sur investissement à Rawai.',
sim1:'Paramètres ajustables',sim2:'Données du marché local',sim3:'Scénario réaliste',sim4:'Résultats clairs',
monthlyIncome:'Revenus locatifs mensuels estimés',annualExpenses:'Dépenses annuelles estimées',
resultsTitle:'Résultats estimés (scénario réaliste)',grossAnnual:'Revenu brut annuel',grossYield:'Rendement brut : ',
annualCosts:'Dépenses annuelles',netAnnual:'Revenu net annuel',netYield:'Rendement net : ',roi:'Retour sur investissement',
simNote:'Résultats estimatifs fondés sur les hypothèses définies par l’utilisateur et les conditions actuelles du marché.',
propertyInfo:'Informations sur le bien',whyPrice:'Ce qui fait la valeur de Villa Manon',
readyTitle:'Prêt à passer à l’étape suivante ?',
readyText:'Villa Manon est prête à vous accueillir. Contactez-nous pour demander une visite privée ou recevoir davantage d’informations.',
contactTitle:'Votre contact pour Villa Manon',ownerLabel:'Propriétaire',
ownerText:'N’hésitez pas à me contacter pour plus d’informations ou pour organiser une visite privée.',
directTitle:'Me contacter directement',
scan:'Scannez le QR code ou <a href="https://wa.me/66617142353" target="_blank" rel="noopener">cliquez ici</a> pour démarrer la conversation.',
messageTitle:'Envoyez-moi un message',name:'Votre nom',email:'E-mail',phone:'Téléphone / WhatsApp',message:'Votre message',
preferredDate:'',sendEmail:'Envoyer par e-mail',viewAll:'Voir les 29 photos ↗',
morning:'Matin',morningText:'Commencez la journée avec un café au bord de la piscine.',
afternoon:'Après-midi',afternoonText:'Profitez du salon ouvert ou de la terrasse.',
evening:'Soirée',eveningText:'Découvrez les meilleurs restaurants de Rawai.',
night:'Nuit',nightText:'Reposez-vous dans une villa calme et sécurisée.'
},
ru:{rentMin:'50 000',rentMax:'600 000',
navHome:'Главная',navVilla:'Вилла',navGallery:'Галерея',navFeatures:'Характеристики',navPlan:'План',navLocation:'Расположение',navInvestment:'Инвестиции',
waViewing:'Запросить просмотр',heroDiscover:'Открыть виллу',newVilla:'Новая вилла в Раваи',
heroTitle:'ВАША НОВАЯ ЖИЗНЬ<br>В РАВАИ',
heroText:'Современная тропическая вилла, созданная для комфорта, уединения и отдыха, всего в нескольких минутах от лучших пляжей Пхукета.',
bedrooms:'Спальни',bathrooms:'Ванные комнаты',privatePool:'Частный<br>бассейн',landSize:'Площадь участка',
verifiedTitle:'Соответствие',verifiedText:'Документы подготовлены в соответствии с законодательством Таиланда.',
transparentTitle:'Доступность',transparentText:'Вилла в настоящее время доступна для продажи.',
fastTitle:'Быстрый ответ',fastText:'Оперативные ответы на ваши вопросы и запросы на просмотр.',
assistTitle:'Сопровождение',assistText:'Персональная поддержка на протяжении всего процесса приобретения.',
whyTitle:'Что делает Villa Manon особенной',
why1:'Востребованное расположение в Раваи: тишина, пляжи, рестораны и вся необходимая инфраструктура',
why2:'Светлые и просторные помещения для естественной жизни между домом и садом',
why3:'Частный бассейн, терраса и сад, созданные для тропического климата',
why4:'Четыре спальни и четыре ванные комнаты обеспечивают комфорт и уединение семье и гостям',
why5:'Полностью меблированная вилла, готовая к проживанию с первого дня',
featuresTitle:'Основные характеристики',featuresCatContract:'Информация об объекте',featuresCatVilla:'Вилла',featuresCatEquipment:'Оснащение',galleryTitle:'Фотогалерея',floorTitle:'План виллы',
floorExploreTitle:'Изучите планировку Villa Manon',
floorExploreText:'Переключайтесь между архитектурным планом и премиальной 3D-визуализацией. Нажмите на метку, чтобы открыть каждую зону.',
blueprint:'Архитектурный план',design3d:'3D-дизайн',privatePoolText:'Частный бассейн',livingArea:'Жилая площадь',
seePhotos:'Смотреть фотографии',fullscreen:'На весь экран',
planHint:'Нажимайте на метки • Для увеличения используйте жест щипка или двойное касание',
dayTitle:'Один день на Villa Manon',livingTitle:'Жизнь в Раваи',
locationTitle:'Расположение и расстояния',livingLocationTitle:'Жизнь в Раваи',
livingLocationText:'Villa Manon расположена в престижной части Раваи, рядом с пляжами, местными рынками, ресторанами, маринами и знаменитыми смотровыми площадками Пхукета. Всё необходимое для комфортной тропической жизни находится в нескольких минутах.',
simTitle:'Инвестиционный калькулятор',simText:'Оцените потенциальный доход от аренды и доходность инвестиций в Раваи.',
sim1:'Настраиваемые параметры',sim2:'Данные местного рынка',sim3:'Реалистичный сценарий',sim4:'Понятные результаты',
monthlyIncome:'Ожидаемый ежемесячный доход от аренды',annualExpenses:'Ожидаемые годовые расходы',
resultsTitle:'Расчётные результаты (реалистичный сценарий)',grossAnnual:'Годовой доход до расходов',grossYield:'Валовая доходность : ',
annualCosts:'Годовые расходы',netAnnual:'Чистый годовой доход',netYield:'Чистая доходность : ',roi:'Доходность инвестиций',
simNote:'Ориентировочные результаты основаны на введённых пользователем данных и текущей рыночной ситуации.',
propertyInfo:'Информация об объекте',whyPrice:'Что формирует ценность Villa Manon',
readyTitle:'Готовы сделать следующий шаг?',
readyText:'Villa Manon готова принять вас. Свяжитесь с нами, чтобы запросить частный просмотр или получить дополнительную информацию.',
contactTitle:'Ваш контакт по Villa Manon',ownerLabel:'Владелец',
ownerText:'Свяжитесь со мной, чтобы получить дополнительную информацию или договориться о частном просмотре.',
directTitle:'Связаться напрямую',
scan:'Отсканируйте QR-код или <a href="https://wa.me/66617142353" target="_blank" rel="noopener">нажмите здесь</a>, чтобы начать разговор.',
messageTitle:'Отправьте мне сообщение',name:'Ваше имя',email:'Электронная почта',phone:'Телефон / WhatsApp',message:'Ваше сообщение',
preferredDate:'',sendEmail:'Отправить по электронной почте',viewAll:'Посмотреть все 29 фотографий ↗',
morning:'Утро',morningText:'Начните день с кофе у бассейна.',
afternoon:'День',afternoonText:'Отдохните в открытой гостиной или на террасе.',
evening:'Вечер',eveningText:'Откройте для себя лучшие рестораны Раваи.',
night:'Ночь',nightText:'Отдохните в тихой и безопасной вилле.'
},
th:{rentMin:'50,000',rentMax:'600,000',
navHome:'หน้าแรก',navVilla:'วิลล่า',navGallery:'แกลเลอรี',navFeatures:'จุดเด่น',navPlan:'แปลน',navLocation:'ทำเล',navInvestment:'การลงทุน',
waViewing:'ขอนัดชมวิลล่า',heroDiscover:'ชมวิลล่า',newVilla:'วิลล่าใหม่ในราไวย์',
heroTitle:'ชีวิตใหม่ของคุณ<br>ในราไวย์',
heroText:'วิลล่าสไตล์ทรอปิคอลโมเดิร์นที่ออกแบบเพื่อความสะดวกสบาย ความเป็นส่วนตัว และการพักผ่อน อยู่ห่างจากชายหาดที่สวยที่สุดของภูเก็ตเพียงไม่กี่นาที',
bedrooms:'ห้องนอน',bathrooms:'ห้องน้ำ',privatePool:'สระว่ายน้ำ<br>ส่วนตัว',landSize:'ขนาดที่ดิน',
verifiedTitle:'ความสอดคล้อง',verifiedText:'เอกสารจัดเตรียมให้สอดคล้องกับกฎหมายไทย',
transparentTitle:'พร้อมจำหน่าย',transparentText:'วิลล่าพร้อมจำหน่ายในขณะนี้',
fastTitle:'ตอบกลับรวดเร็ว',fastText:'ตอบคำถามและคำขอเข้าชมของคุณอย่างรวดเร็ว',
assistTitle:'การดูแล',assistText:'ให้ความช่วยเหลือแบบส่วนตัวตลอดกระบวนการซื้อ',
whyTitle:'สิ่งที่ทำให้ Villa Manon โดดเด่น',
why1:'ทำเลที่เป็นที่ต้องการในราไวย์ ใกล้ชายหาด ร้านอาหาร สิ่งอำนวยความสะดวก และยังคงความสงบ',
why2:'พื้นที่สว่างและเชื่อมต่อกันอย่างลงตัว เหมาะกับการใช้ชีวิตทั้งภายในและภายนอก',
why3:'สระว่ายน้ำส่วนตัว ระเบียง และสวนที่ออกแบบมาให้เหมาะกับสภาพอากาศเขตร้อน',
why4:'สี่ห้องนอนและสี่ห้องน้ำ มอบความสะดวกสบายและความเป็นส่วนตัวแก่ครอบครัวและแขก',
why5:'วิลล่าพร้อมเฟอร์นิเจอร์ครบ สามารถเข้าอยู่ได้ทันที',
featuresTitle:'คุณสมบัติหลัก',featuresCatContract:'ข้อมูลทรัพย์สิน',featuresCatVilla:'ตัววิลล่า',featuresCatEquipment:'สิ่งอำนวยความสะดวก',galleryTitle:'แกลเลอรีภาพ',floorTitle:'แปลนวิลล่า',
floorExploreTitle:'สำรวจการจัดวางพื้นที่ของ Villa Manon',
floorExploreText:'สลับระหว่างแปลนสถาปัตยกรรมและภาพจำลอง 3D ระดับพรีเมียม แตะจุดบนแปลนเพื่อดูแต่ละพื้นที่',
blueprint:'แปลนสถาปัตยกรรม',design3d:'ดีไซน์ 3D',privatePoolText:'สระว่ายน้ำส่วนตัว',livingArea:'พื้นที่ใช้สอย',
seePhotos:'ดูรูปภาพ',fullscreen:'เต็มหน้าจอ',
planHint:'แตะจุดบนแปลน • ใช้นิ้วบีบหรือแตะสองครั้งในโหมดเต็มหน้าจอเพื่อซูม',
dayTitle:'หนึ่งวันที่ Villa Manon',livingTitle:'ใช้ชีวิตในราไวย์',
locationTitle:'ทำเลและระยะทาง',livingLocationTitle:'ใช้ชีวิตในราไวย์',
livingLocationText:'Villa Manon ตั้งอยู่ในทำเลพิเศษของราไวย์ ใกล้ชายหาด ตลาดท้องถิ่น ร้านอาหาร ท่าจอดเรือ และจุดชมวิวสำคัญของภูเก็ต ทุกสิ่งที่จำเป็นสำหรับการใช้ชีวิตแบบทรอปิคอลที่สะดวกสบายอยู่ห่างออกไปเพียงไม่กี่นาที',
simTitle:'เครื่องคำนวณการลงทุน',simText:'ประเมินรายได้ค่าเช่าที่เป็นไปได้และผลตอบแทนจากการลงทุนในราไวย์',
sim1:'ปรับค่าต่าง ๆ ได้',sim2:'ข้อมูลตลาดในพื้นที่',sim3:'สถานการณ์สมจริง',sim4:'ผลลัพธ์ชัดเจน',
monthlyIncome:'รายได้ค่าเช่ารายเดือนโดยประมาณ',annualExpenses:'ค่าใช้จ่ายรายปีโดยประมาณ',
resultsTitle:'ผลลัพธ์โดยประมาณ (สถานการณ์สมจริง)',grossAnnual:'รายได้รวมต่อปี',grossYield:'ผลตอบแทนรวม : ',
annualCosts:'ค่าใช้จ่ายรายปี',netAnnual:'รายได้สุทธิต่อปี',netYield:'ผลตอบแทนสุทธิ : ',roi:'ผลตอบแทนจากการลงทุน',
simNote:'ผลลัพธ์เป็นเพียงการประมาณการจากข้อมูลที่ผู้ใช้กำหนดและสภาวะตลาดปัจจุบัน',
propertyInfo:'ข้อมูลทรัพย์สิน',whyPrice:'สิ่งที่สร้างมูลค่าให้ Villa Manon',
readyTitle:'พร้อมก้าวต่อไปหรือยัง',
readyText:'Villa Manon พร้อมต้อนรับคุณ ติดต่อเราเพื่อนัดชมแบบส่วนตัวหรือขอข้อมูลเพิ่มเติม',
contactTitle:'ผู้ติดต่อสำหรับ Villa Manon',ownerLabel:'เจ้าของ',
ownerText:'ติดต่อฉันได้เพื่อขอข้อมูลเพิ่มเติมหรือนัดชมวิลล่าแบบส่วนตัว',
directTitle:'ติดต่อฉันโดยตรง',
scan:'สแกนคิวอาร์โค้ดหรือ <a href="https://wa.me/66617142353" target="_blank" rel="noopener">คลิกที่นี่</a> เพื่อเริ่มการสนทนา',
messageTitle:'ส่งข้อความถึงฉัน',name:'ชื่อของคุณ',email:'อีเมล',phone:'โทรศัพท์ / WhatsApp',message:'ข้อความของคุณ',
preferredDate:'',sendEmail:'ส่งทางอีเมล',viewAll:'ดูภาพทั้งหมด 29 ภาพ ↗',
morning:'ช่วงเช้า',morningText:'เริ่มต้นวันด้วยกาแฟริมสระว่ายน้ำ',
afternoon:'ช่วงบ่าย',afternoonText:'พักผ่อนในห้องนั่งเล่นแบบเปิดโล่งหรือบนระเบียง',
evening:'ช่วงเย็น',eveningText:'ค้นพบร้านอาหารที่ดีที่สุดในราไวย์',
night:'กลางคืน',nightText:'พักผ่อนในวิลล่าที่เงียบสงบและปลอดภัย'
}
};
Object.assign(t.en,{"pageTitle": "Villa Manon — Rawai, Phuket", "destinationEyebrow": "Destination", "discoverRawaiTitle": "Discover Rawai", "discoverRawaiText": "Discover the atmosphere of Rawai, its beaches, restaurants, markets, islands and tropical lifestyle before visiting Villa Manon.", "rawaiVideoTitle": "Discover Rawai on video", "rawaiVideoPlaceholder": "Add your YouTube, Vimeo or MP4 video here.", "featLeasehold": "30-year leasehold (renewable)", "featLand": "Land size: approximately 400 m²", "featBuilt": "Built-up area: approximately 250 m²", "featBedrooms": "4 spacious bedrooms", "featBathrooms": "4 modern bathrooms", "featPool": "Private pool measuring 7 × 3 m", "featKitchen": "Fully equipped kitchen", "featTV": "Samsung QLED 75” TV", "featGate": "Automatic gate and covered parking", "featWell": "100 m deep well", "featAircon": "Air conditioning and ceiling fans", "featWatering": "Automatic garden irrigation system", "featInternet": "High-speed fibre internet", "villaSectionEyebrow": "04 — Villa Manon", "naiHarnBeach": "Nai Harn Beach", "rawaiBeach": "Rawai Beach", "promthepCape": "Promthep Cape", "rawaiMarket": "Rawai Market", "watChalong": "Wat Chalong", "bigBuddha": "Big Buddha", "fiveMin": "5 min", "fifteenMin": "15 min", "twentyFiveMin": "25 min", "perMonth": "/ month", "perYear": "/ year", "priceLabel": "Price", "ownershipLabel": "Ownership", "ownershipValue": "30-year leasehold", "landTitleLabel": "Land title", "chanoteValue": "Chanote", "transferFeesLabel": "Transfer fees", "furnishingLabel": "Furnishing", "furnishingValue": "Fully furnished", "availabilityLabel": "Availability", "availabilityValue": "Immediately", "valuePrimeLocation": "Prime location in Rawai", "valueQuietLand": "400 m² in a quiet residential setting", "valueConstruction": "Recent construction with quality finishes", "valueRoomsPool": "4 bedrooms, 4 bathrooms and a private pool", "valueReady": "Fully furnished and ready to move in", "valueRental": "Strong rental potential and long-term value", "propertyOwnerBadge": "Property owner", "rawaiPhuketBadge": "Rawai, Phuket", "languagesBadge": "EN / FR", "phoneLabel": "Phone", "emailLabel": "Email", "whatsappQrTitle": "WhatsApp QR code", "galleryModalTitle": "Villa Manon — Photo gallery", "villaManonLabel": "Villa Manon", "zoneLabel": "Area", "blueprintCaption": "Villa Manon — Architectural plan", "zoomHint": "Pinch or double-tap to zoom"});
Object.assign(t.fr,{"pageTitle": "Villa Manon — Rawai, Phuket", "destinationEyebrow": "Destination", "discoverRawaiTitle": "À la découverte de Rawai", "discoverRawaiText": "Découvrez l’atmosphère de Rawai, ses plages, ses restaurants, ses marchés, ses îles et son art de vivre tropical avant de visiter Villa Manon.", "rawaiVideoTitle": "Découvrir Rawai en vidéo", "rawaiVideoPlaceholder": "", "featLeasehold": "Bail de 30 ans renouvelable", "featLand": "Terrain d’environ 400 m²", "featBuilt": "Surface construite d’environ 250 m²", "featBedrooms": "4 chambres spacieuses", "featBathrooms": "4 salles de bains modernes", "featPool": "Piscine privée de 7 × 3 m", "featKitchen": "Cuisine entièrement équipée", "featTV": "Téléviseur Samsung QLED 75 pouces", "featGate": "Portail automatique et parking couvert", "featWell": "Puits profond de 100 m", "featAircon": "Climatisation et ventilateurs de plafond", "featWatering": "Système d’arrosage automatique du jardin", "featInternet": "Internet fibre haut débit", "villaSectionEyebrow": "04 — Villa Manon", "naiHarnBeach": "Plage de Nai Harn", "rawaiBeach": "Plage de Rawai", "promthepCape": "Cap Promthep", "rawaiMarket": "Marché de Rawai", "watChalong": "Wat Chalong", "bigBuddha": "Grand Bouddha", "fiveMin": "5 min", "fifteenMin": "15 min", "twentyFiveMin": "25 min", "perMonth": "/ mois", "perYear": "/ an", "priceLabel": "Prix", "ownershipLabel": "Type de propriété", "ownershipValue": "Bail de 30 ans", "landTitleLabel": "Titre foncier", "chanoteValue": "Chanote", "transferFeesLabel": "Frais de transfert", "furnishingLabel": "Mobilier", "furnishingValue": "Entièrement meublée", "availabilityLabel": "Disponibilité", "availabilityValue": "Immédiate", "valuePrimeLocation": "Emplacement privilégié à Rawai", "valueQuietLand": "400 m² dans un environnement résidentiel calme", "valueConstruction": "Construction récente et finitions de qualité", "valueRoomsPool": "4 chambres, 4 salles de bains et piscine privée", "valueReady": "Entièrement meublée et prête à vivre", "valueRental": "Fort potentiel locatif et valeur à long terme", "propertyOwnerBadge": "Propriétaire", "rawaiPhuketBadge": "Rawai, Phuket", "languagesBadge": "EN / FR", "phoneLabel": "Téléphone", "emailLabel": "E-mail", "whatsappQrTitle": "QR code WhatsApp", "galleryModalTitle": "Villa Manon — Galerie photos", "villaManonLabel": "Villa Manon", "zoneLabel": "Zone", "blueprintCaption": "Villa Manon — Plan architectural", "zoomHint": "Pincez ou touchez deux fois pour zoomer"});
Object.assign(t.ru,{"pageTitle": "Villa Manon — Раваи, Пхукет", "destinationEyebrow": "Направление", "discoverRawaiTitle": "Откройте для себя Раваи", "discoverRawaiText": "Познакомьтесь с атмосферой Раваи, его пляжами, ресторанами, рынками, островами и тропическим образом жизни перед посещением Villa Manon.", "rawaiVideoTitle": "Откройте Раваи на видео", "rawaiVideoPlaceholder": "Добавьте сюда видео YouTube, Vimeo или MP4.", "featLeasehold": "Аренда на 30 лет с возможностью продления", "featLand": "Площадь участка: около 400 м²", "featBuilt": "Площадь застройки: около 250 м²", "featBedrooms": "4 просторные спальни", "featBathrooms": "4 современные ванные комнаты", "featPool": "Частный бассейн 6 × 3 м", "featKitchen": "Полностью оборудованная кухня", "featTV": "Телевизор Samsung QLED 75 дюймов", "featGate": "Автоматические ворота и крытая парковка", "featWell": "Скважина глубиной 100 м", "featAircon": "Кондиционеры и потолочные вентиляторы", "featWatering": "Автоматическая система полива сада", "featInternet": "Высокоскоростной оптоволоконный интернет", "villaSectionEyebrow": "04 — Villa Manon", "naiHarnBeach": "Пляж Най Харн", "rawaiBeach": "Пляж Раваи", "promthepCape": "Мыс Промтеп", "rawaiMarket": "Рынок Раваи", "watChalong": "Ват Чалонг", "bigBuddha": "Большой Будда", "fiveMin": "5 мин", "fifteenMin": "15 мин", "twentyFiveMin": "25 мин", "perMonth": "/ месяц", "perYear": "/ год", "priceLabel": "Цена", "ownershipLabel": "Форма владения", "ownershipValue": "Аренда на 30 лет", "landTitleLabel": "Документ на землю", "chanoteValue": "Чанот", "transferFeesLabel": "Сборы за передачу", "furnishingLabel": "Меблировка", "furnishingValue": "Полностью меблирована", "availabilityLabel": "Доступность", "availabilityValue": "Сразу", "valuePrimeLocation": "Престижное расположение в Раваи", "valueQuietLand": "400 м² в тихом жилом районе", "valueConstruction": "Недавняя постройка и качественная отделка", "valueRoomsPool": "4 спальни, 4 ванные комнаты и частный бассейн", "valueReady": "Полностью меблирована и готова к заселению", "valueRental": "Высокий арендный потенциал и долгосрочная ценность", "propertyOwnerBadge": "Владелец недвижимости", "rawaiPhuketBadge": "Раваи, Пхукет", "languagesBadge": "EN / FR", "phoneLabel": "Телефон", "emailLabel": "Электронная почта", "whatsappQrTitle": "QR-код WhatsApp", "galleryModalTitle": "Villa Manon — Фотогалерея", "villaManonLabel": "Villa Manon", "zoneLabel": "Зона", "blueprintCaption": "Villa Manon — Архитектурный план", "zoomHint": "Сведите пальцы или дважды коснитесь для увеличения"});
Object.assign(t.th,{"pageTitle": "Villa Manon — ราไวย์ ภูเก็ต", "destinationEyebrow": "จุดหมายปลายทาง", "discoverRawaiTitle": "ทำความรู้จักราไวย์", "discoverRawaiText": "สัมผัสบรรยากาศของราไวย์ ทั้งชายหาด ร้านอาหาร ตลาด เกาะต่าง ๆ และวิถีชีวิตแบบเขตร้อน ก่อนเข้าชม Villa Manon", "rawaiVideoTitle": "ชมราไวย์ผ่านวิดีโอ", "rawaiVideoPlaceholder": "เพิ่มวิดีโอ YouTube, Vimeo หรือ MP4 ของคุณที่นี่", "featLeasehold": "สิทธิการเช่า 30 ปี ต่ออายุได้", "featLand": "ขนาดที่ดินประมาณ 400 ตร.ม.", "featBuilt": "พื้นที่ก่อสร้างประมาณ 250 ตร.ม.", "featBedrooms": "4 ห้องนอนกว้างขวาง", "featBathrooms": "4 ห้องน้ำทันสมัย", "featPool": "สระว่ายน้ำส่วนตัวขนาด 6 × 3 ม.", "featKitchen": "ห้องครัวพร้อมอุปกรณ์ครบครัน", "featTV": "โทรทัศน์ Samsung QLED ขนาด 75 นิ้ว", "featGate": "ประตูอัตโนมัติและที่จอดรถมีหลังคา", "featWell": "บ่อน้ำลึก 100 ม.", "featAircon": "เครื่องปรับอากาศและพัดลมเพดาน", "featWatering": "ระบบรดน้ำสวนอัตโนมัติ", "featInternet": "อินเทอร์เน็ตไฟเบอร์ความเร็วสูง", "villaSectionEyebrow": "04 — Villa Manon", "naiHarnBeach": "หาดในหาน", "rawaiBeach": "หาดราไวย์", "promthepCape": "แหลมพรหมเทพ", "rawaiMarket": "ตลาดราไวย์", "watChalong": "วัดฉลอง", "bigBuddha": "พระใหญ่", "fiveMin": "5 นาที", "fifteenMin": "15 นาที", "twentyFiveMin": "25 นาที", "perMonth": "/ เดือน", "perYear": "/ ปี", "priceLabel": "ราคา", "ownershipLabel": "รูปแบบการถือครอง", "ownershipValue": "สิทธิการเช่า 30 ปี", "landTitleLabel": "เอกสารสิทธิ์ที่ดิน", "chanoteValue": "โฉนด", "transferFeesLabel": "ค่าธรรมเนียมการโอน", "furnishingLabel": "เฟอร์นิเจอร์", "furnishingValue": "พร้อมเฟอร์นิเจอร์ครบ", "availabilityLabel": "พร้อมเข้าอยู่", "availabilityValue": "ทันที", "valuePrimeLocation": "ทำเลเด่นในราไวย์", "valueQuietLand": "ที่ดิน 400 ตร.ม. ในย่านที่อยู่อาศัยอันเงียบสงบ", "valueConstruction": "ก่อสร้างใหม่และตกแต่งด้วยวัสดุคุณภาพ", "valueRoomsPool": "4 ห้องนอน 4 ห้องน้ำ และสระว่ายน้ำส่วนตัว", "valueReady": "พร้อมเฟอร์นิเจอร์ครบและเข้าอยู่ได้ทันที", "valueRental": "มีศักยภาพด้านการเช่าสูงและมูลค่าในระยะยาว", "propertyOwnerBadge": "เจ้าของทรัพย์สิน", "rawaiPhuketBadge": "ราไวย์ ภูเก็ต", "languagesBadge": "EN / FR", "phoneLabel": "โทรศัพท์", "emailLabel": "อีเมล", "whatsappQrTitle": "คิวอาร์โค้ด WhatsApp", "galleryModalTitle": "Villa Manon — แกลเลอรีภาพ", "villaManonLabel": "Villa Manon", "zoneLabel": "พื้นที่", "blueprintCaption": "Villa Manon — แปลนสถาปัตยกรรม", "zoomHint": "ใช้นิ้วบีบหรือแตะสองครั้งเพื่อซูม"});
Object.assign(t.en,{
  pageTitle:'Villa for Sale in Phuket, Rawai | Villa Manon',
  why4:'Four bedrooms and five bathrooms offering comfort and privacy for family and guests',
  featLeasehold:'30-year leasehold, renewable (many possibilities).',
  featConstructionYear:'Construction: 2026',
  featLand:'480 m² land size',featBathrooms:'5 bathrooms',
  featTV:'Sala with Samsung QLED 75-inch TV',
  featLivingTV:'Huge living room with Samsung QLED 75-inch TV',
  featBedroomTV:'Every bedroom equipped with a Samsung QLED 65-inch TV',
  featGasBarbecue:'Gas barbecue',
  ownershipValue:'30-year leasehold, renewable (many possibilities).',
  valueQuietLand:'480 m² land size in a quiet residential setting',
  valueRoomsPool:'4 bedrooms, 5 bathrooms and a private pool',
  closeLabel:'Close',previousPhotoLabel:'Previous photo',nextPhotoLabel:'Next photo',
  showPhotoLabel:'Show photo',photoLabel:'photo',viewPhotosLabel:'View photos',
  galleryDialogLabel:'Villa Manon photo gallery',zonePhotosDialogLabel:'Photos of the selected area',
  mapDialogLabel:'Villa Manon location map',enlargeMapLabel:'Enlarge the location map',
  openPlanFullscreenLabel:'Open floor plan fullscreen',
  zoneBedroom1:'Bedroom 1 & bathroom',zoneBedroom2:'Bedroom 2 & bathroom',
  zoneBedroom3:'Bedroom 3 & bathroom',zoneBedroom4:'Bedroom 4 & bathroom',
  zoneLiving:'Living room & TV area',zoneKitchen:'Kitchen',zonePool:'Private pool',zoneSala:'Sala',
  zoneBedroom1Info:'Private bedroom with direct access to its bathroom.',
  zoneBedroom2Info:'Quiet bedroom beside the central living area.',
  zoneBedroom3Info:'Spacious bedroom with integrated storage.',
  zoneBedroom4Info:'Comfortable guest bedroom near the living room.',
  zoneLivingInfo:'Large open-plan social space facing the pool.',
  zoneKitchenInfo:'Open kitchen with island and generous preparation space.',
  zonePoolInfo:'A 7 × 3 metre swimming pool framed by the terrace and sun loungers.',
  zoneSalaInfo:'Covered outdoor dining and relaxation pavilion.'
});
Object.assign(t.fr,{
  pageTitle:'Villa à vendre à Phuket, Rawai | Villa Manon',
  why4:'Quatre chambres et cinq salles de bains offrant confort et intimité à la famille et aux invités',
  featLeasehold:'Bail de 30 ans, renouvelable (de nombreuses possibilités).',
  featConstructionYear:'Construction : 2026',
  featLand:'Terrain de 480 m²',featBathrooms:'5 salles de bains',
  featTV:'Sala avec téléviseur Samsung QLED 75 pouces',
  featLivingTV:'Immense salon avec téléviseur Samsung QLED 75 pouces',
  featBedroomTV:'Chaque chambre est équipée d’un téléviseur Samsung QLED 65 pouces',
  featGasBarbecue:'Barbecue à gaz',
  ownershipValue:'Bail de 30 ans, renouvelable (de nombreuses possibilités).',
  valueQuietLand:'Terrain de 480 m² dans un environnement résidentiel calme',
  valueRoomsPool:'4 chambres, 5 salles de bains et piscine privée',
  closeLabel:'Fermer',previousPhotoLabel:'Photo précédente',nextPhotoLabel:'Photo suivante',
  showPhotoLabel:'Afficher la photo',photoLabel:'photo',viewPhotosLabel:'Afficher les photos',
  galleryDialogLabel:'Galerie photos de Villa Manon',zonePhotosDialogLabel:'Photos de la zone sélectionnée',
  mapDialogLabel:'Carte de localisation de Villa Manon',enlargeMapLabel:'Agrandir la carte de localisation',
  openPlanFullscreenLabel:'Ouvrir le plan en plein écran',
  zoneBedroom1:'Chambre 1 et salle de bain',zoneBedroom2:'Chambre 2 et salle de bain',
  zoneBedroom3:'Chambre 3 et salle de bain',zoneBedroom4:'Chambre 4 et salle de bain',
  zoneLiving:'Salon et espace télévision',zoneKitchen:'Cuisine',zonePool:'Piscine privée',zoneSala:'Sala',
  zoneBedroom1Info:'Chambre privée avec accès direct à sa salle de bain.',
  zoneBedroom2Info:'Chambre calme située à côté de l’espace de vie central.',
  zoneBedroom3Info:'Chambre spacieuse avec rangements intégrés.',
  zoneBedroom4Info:'Chambre d’amis confortable à proximité du salon.',
  zoneLivingInfo:'Grand espace de vie ouvert faisant face à la piscine.',
  zoneKitchenInfo:'Cuisine ouverte avec îlot et vaste espace de préparation.',
  zonePoolInfo:'Piscine de 7 × 3 mètres bordée par la terrasse et les bains de soleil.',
  zoneSalaInfo:'Pavillon couvert pour les repas et la détente en plein air.'
});
Object.assign(t.ru,{
  pageTitle:'Вилла на продажу на Пхукете, Раваи | Villa Manon',
  why4:'Четыре спальни и пять ванных комнат обеспечивают комфорт и уединение для семьи и гостей',
  featLeasehold:'Аренда на 30 лет, с возможностью продления (множество вариантов).',
  featConstructionYear:'Год постройки: 2026',
  featLand:'Площадь участка — 480 м²',featBathrooms:'5 ванных комнат',
  featPool:'Частный бассейн 7 × 3 м',
  featTV:'Сала с телевизором Samsung QLED 75 дюймов',
  featLivingTV:'Огромная гостиная с телевизором Samsung QLED 75 дюймов',
  featBedroomTV:'В каждой спальне установлен телевизор Samsung QLED 65 дюймов',
  featGasBarbecue:'Газовый барбекю',
  ownershipValue:'Аренда на 30 лет, с возможностью продления (множество вариантов).',
  valueQuietLand:'Участок 480 м² в тихом жилом районе',
  valueRoomsPool:'4 спальни, 5 ванных комнат и частный бассейн',
  closeLabel:'Закрыть',previousPhotoLabel:'Предыдущее фото',nextPhotoLabel:'Следующее фото',
  showPhotoLabel:'Показать фото',photoLabel:'фото',viewPhotosLabel:'Показать фотографии',
  galleryDialogLabel:'Фотогалерея Villa Manon',zonePhotosDialogLabel:'Фотографии выбранной зоны',
  mapDialogLabel:'Карта расположения Villa Manon',enlargeMapLabel:'Увеличить карту расположения',
  openPlanFullscreenLabel:'Открыть план на весь экран',
  zoneBedroom1:'Спальня 1 и ванная',zoneBedroom2:'Спальня 2 и ванная',
  zoneBedroom3:'Спальня 3 и ванная',zoneBedroom4:'Спальня 4 и ванная',
  zoneLiving:'Гостиная и ТВ-зона',zoneKitchen:'Кухня',zonePool:'Частный бассейн',zoneSala:'Сала',
  zoneBedroom1Info:'Отдельная спальня с прямым доступом в ванную комнату.',
  zoneBedroom2Info:'Тихая спальня рядом с центральной гостиной.',
  zoneBedroom3Info:'Просторная спальня со встроенными местами для хранения.',
  zoneBedroom4Info:'Уютная гостевая спальня рядом с гостиной.',
  zoneLivingInfo:'Большое открытое пространство для общения с видом на бассейн.',
  zoneKitchenInfo:'Открытая кухня с островом и просторной рабочей зоной.',
  zonePoolInfo:'Бассейн размером 7 × 3 метра, окружённый террасой и шезлонгами.',
  zoneSalaInfo:'Крытый павильон для отдыха и приёма пищи на открытом воздухе.'
});
Object.assign(t.th,{
  pageTitle:'วิลล่าขายในภูเก็ต ราไวย์ | Villa Manon',
  why4:'ห้องนอน 4 ห้องและห้องน้ำ 5 ห้อง มอบความสะดวกสบายและความเป็นส่วนตัวสำหรับครอบครัวและแขก',
  featLeasehold:'สิทธิการเช่า 30 ปี ต่ออายุได้ (มีความเป็นไปได้หลากหลาย)',
  featConstructionYear:'ปีที่ก่อสร้าง: 2026',
  featLand:'ที่ดินขนาด 480 ตร.ม.',featBathrooms:'5 ห้องน้ำ',
  featPool:'สระว่ายน้ำส่วนตัวขนาด 7 × 3 ม.',
  featTV:'ศาลาพร้อมโทรทัศน์ Samsung QLED ขนาด 75 นิ้ว',
  featLivingTV:'ห้องนั่งเล่นขนาดใหญ่พร้อมโทรทัศน์ Samsung QLED ขนาด 75 นิ้ว',
  featBedroomTV:'ทุกห้องนอนติดตั้งโทรทัศน์ Samsung QLED ขนาด 65 นิ้ว',
  featGasBarbecue:'เตาบาร์บีคิวแก๊ส',
  ownershipValue:'สิทธิการเช่า 30 ปี ต่ออายุได้ (มีความเป็นไปได้หลากหลาย)',
  valueQuietLand:'ที่ดินขนาด 480 ตร.ม. ในย่านที่อยู่อาศัยอันเงียบสงบ',
  valueRoomsPool:'4 ห้องนอน 5 ห้องน้ำ และสระว่ายน้ำส่วนตัว',
  closeLabel:'ปิด',previousPhotoLabel:'รูปก่อนหน้า',nextPhotoLabel:'รูปถัดไป',
  showPhotoLabel:'แสดงรูป',photoLabel:'รูป',viewPhotosLabel:'ดูรูปภาพ',
  galleryDialogLabel:'แกลเลอรีภาพ Villa Manon',zonePhotosDialogLabel:'รูปภาพของพื้นที่ที่เลือก',
  mapDialogLabel:'แผนที่ตำแหน่ง Villa Manon',enlargeMapLabel:'ขยายแผนที่ตำแหน่ง',
  openPlanFullscreenLabel:'เปิดแปลนแบบเต็มหน้าจอ',
  zoneBedroom1:'ห้องนอน 1 และห้องน้ำ',zoneBedroom2:'ห้องนอน 2 และห้องน้ำ',
  zoneBedroom3:'ห้องนอน 3 และห้องน้ำ',zoneBedroom4:'ห้องนอน 4 และห้องน้ำ',
  zoneLiving:'ห้องนั่งเล่นและพื้นที่ทีวี',zoneKitchen:'ห้องครัว',zonePool:'สระว่ายน้ำส่วนตัว',zoneSala:'ศาลา',
  zoneBedroom1Info:'ห้องนอนส่วนตัวที่เชื่อมต่อกับห้องน้ำโดยตรง',
  zoneBedroom2Info:'ห้องนอนเงียบสงบติดกับพื้นที่นั่งเล่นส่วนกลาง',
  zoneBedroom3Info:'ห้องนอนกว้างขวางพร้อมพื้นที่เก็บของในตัว',
  zoneBedroom4Info:'ห้องนอนแขกแสนสบายใกล้ห้องนั่งเล่น',
  zoneLivingInfo:'พื้นที่นั่งเล่นแบบเปิดโล่งขนาดใหญ่หันหน้าเข้าหาสระว่ายน้ำ',
  zoneKitchenInfo:'ห้องครัวแบบเปิดพร้อมไอส์แลนด์และพื้นที่เตรียมอาหารกว้างขวาง',
  zonePoolInfo:'สระว่ายน้ำขนาด 7 × 3 เมตร ล้อมรอบด้วยระเบียงและเก้าอี้อาบแดด',
  zoneSalaInfo:'ศาลาในร่มสำหรับรับประทานอาหารและพักผ่อนกลางแจ้ง'
});
t.zh={...t.en,
 pageTitle:'普吉岛拉威待售别墅 | Villa Manon',navHome:'首页',navVilla:'别墅',navGallery:'图库',navFeatures:'特色',navPlan:'平面图',navLocation:'位置',navInvestment:'投资',
 waViewing:'预约看房',heroDiscover:'探索别墅',newVilla:'普吉岛拉威待售别墅',heroTitle:'普吉岛<br>待售别墅',heroText:'探索 Villa Manon：一座位于普吉岛拉威黄金地段、拥有四间卧室和私人泳池的现代热带别墅。',
 bedrooms:'卧室',bathrooms:'浴室',privatePool:'私人<br>泳池',landSize:'土地面积',verifiedTitle:'合规保障',verifiedText:'文件依照泰国法律准备。',transparentTitle:'可售状态',transparentText:'别墅目前正在出售。',fastTitle:'快速回复',fastText:'快速回复您的问题和看房请求。',assistTitle:'专属协助',assistText:'在整个购房过程中提供个性化协助。',
 whyTitle:'Villa Manon 的独特之处',why1:'拉威热门地段，兼具宁静、海滩、餐厅与日常便利',why2:'明亮流畅的空间，营造自然的室内外生活方式',why3:'私人泳池、露台和花园，尽享热带气候',why4:'四间卧室和五间浴室，为家人和宾客提供舒适与私密空间',why5:'家具齐全，可立即入住',
 featuresTitle:'主要特色',featuresCatContract:'房产信息',featuresCatVilla:'别墅',featuresCatEquipment:'设备',galleryTitle:'照片图库',floorTitle:'别墅平面图',floorExploreTitle:'探索 Villa Manon 的布局',floorExploreText:'在建筑平面图与高级 3D 效果图之间切换。点击标记查看各个空间。',blueprint:'建筑平面图',design3d:'3D 设计',privatePoolText:'私人泳池',livingArea:'居住面积',seePhotos:'查看照片',fullscreen:'全屏',planHint:'点击标记 • 在全屏模式下双指缩放或双击放大',
 livingLocationTitle:'拉威生活',livingTitle:'拉威生活',locationTitle:'位置与距离',livingLocationText:'Villa Manon 位于拉威优越地段，邻近海滩、本地市场、餐厅、码头和普吉岛著名观景点。',
 simTitle:'投资模拟器',simText:'估算在拉威的潜在租金收入和投资回报。',sim1:'参数可调',sim2:'当地市场数据',sim3:'现实情景',sim4:'结果清晰',monthlyIncome:'预计每月租金收入',annualExpenses:'预计年度支出',resultsTitle:'预计结果（现实情景）',grossAnnual:'年度总收入',grossYield:'毛收益率：',annualCosts:'年度支出',netAnnual:'年度净收入',netYield:'净收益率：',roi:'投资回报',simNote:'结果仅供参考，基于用户输入的假设和当前市场状况。',
 propertyInfo:'房产信息',whyPrice:'Villa Manon 的价值所在',readyTitle:'准备迈出下一步了吗？',readyText:'请联系我们预约私人看房或获取更多信息。',contactTitle:'Villa Manon 联系人',ownerLabel:'业主',ownerText:'欢迎联系我了解更多信息或安排私人看房。',directTitle:'直接联系我',scan:'扫描二维码或<a href="https://wa.me/66617142353" target="_blank" rel="noopener">点击此处</a>开始对话。',messageTitle:'给我留言',name:'您的姓名',email:'电子邮箱',phone:'电话 / WhatsApp',message:'您的留言',sendEmail:'通过电子邮件发送',viewAll:'查看全部 29 张照片 ↗',
 destinationEyebrow:'目的地',discoverRawaiTitle:'探索拉威',discoverRawaiText:'探索拉威的海滩、餐厅、市场、岛屿和热带生活方式。',rawaiVideoTitle:'通过视频探索拉威',
 featLeasehold:'30 年租赁权，可续期（多种可能性）。',featLand:'土地面积 480 平方米',featBuilt:'建筑面积约 250 平方米',featConstructionYear:'建造年份：2026',featBedrooms:'4 间宽敞卧室',featBathrooms:'5 间浴室',featPool:'7 × 3 米私人泳池',featKitchen:'设备齐全的厨房',featTV:'Sala 配备 75 英寸 Samsung QLED 电视',featLivingTV:'超大客厅配备 75 英寸 Samsung QLED 电视',featBedroomTV:'每间卧室均配备 65 英寸 Samsung QLED 电视',featGasBarbecue:'燃气烧烤炉',featGate:'自动门和有顶停车位',featWell:'100 米深水井',featAircon:'空调和吊扇',featWatering:'花园自动灌溉系统',featInternet:'高速光纤网络',
 naiHarnBeach:'奈汉海滩',rawaiBeach:'拉威海滩',promthepCape:'神仙半岛',rawaiMarket:'拉威市场',watChalong:'查龙寺',bigBuddha:'普吉大佛',fiveMin:'5 分钟',fifteenMin:'15 分钟',twentyFiveMin:'25 分钟',perMonth:'/ 月',perYear:'/ 年',priceLabel:'价格',ownershipLabel:'产权形式',ownershipValue:'30 年租赁权，可续期（多种可能性）。',landTitleLabel:'土地权证',chanoteValue:'Chanote 地契',transferFeesLabel:'过户费用',furnishingLabel:'家具',furnishingValue:'家具齐全',availabilityLabel:'可入住时间',availabilityValue:'立即入住',valuePrimeLocation:'拉威黄金地段',valueQuietLand:'安静住宅区内的 480 平方米土地',valueConstruction:'2026 年建成，优质装修',valueRoomsPool:'4 间卧室、5 间浴室和私人泳池',valueReady:'家具齐全，可立即入住',valueRental:'租赁潜力强，长期价值突出',
 galleryModalTitle:'Villa Manon — 照片图库',villaManonLabel:'Villa Manon',zoneLabel:'区域',blueprintCaption:'Villa Manon — 建筑平面图',zoomHint:'双指缩放或双击放大',closeLabel:'关闭',previousPhotoLabel:'上一张照片',nextPhotoLabel:'下一张照片',showPhotoLabel:'显示照片',photoLabel:'照片',viewPhotosLabel:'查看照片',galleryDialogLabel:'Villa Manon 照片图库',zonePhotosDialogLabel:'所选区域的照片',mapDialogLabel:'Villa Manon 位置地图',enlargeMapLabel:'放大位置地图',openPlanFullscreenLabel:'全屏打开平面图',
 propertyOwnerBadge:'业主',rawaiPhuketBadge:'拉威，普吉岛',languagesBadge:'5 种语言',emailLabel:'电子邮箱',phoneLabel:'电话',whatsappQrTitle:'WhatsApp 二维码',
 zoneBedroom1:'卧室 1 和浴室',zoneBedroom2:'卧室 2 和浴室',zoneBedroom3:'卧室 3 和浴室',zoneBedroom4:'卧室 4 和浴室',zoneLiving:'客厅和电视区',zoneKitchen:'厨房',zonePool:'私人泳池',zoneSala:'Sala 凉亭',zoneBedroom1Info:'带独立浴室入口的私人卧室。',zoneBedroom2Info:'位于中央起居区旁的安静卧室。',zoneBedroom3Info:'带内置储物空间的宽敞卧室。',zoneBedroom4Info:'靠近客厅的舒适客房。',zoneLivingInfo:'面向泳池的大型开放式社交空间。',zoneKitchenInfo:'带中岛和宽敞备餐区的开放式厨房。',zonePoolInfo:'7 × 3 米泳池，周围设有露台和躺椅。',zoneSalaInfo:'适合户外用餐和休闲的有顶凉亭。'
};
Object.assign(t.en,{languagesBadge:'5 languages'});
Object.assign(t.fr,{languagesBadge:'5 langues'});
Object.assign(t.ru,{languagesBadge:'5 языков'});
Object.assign(t.th,{languagesBadge:'5 ภาษา'});

function applySaleCorrections(d){
  document.querySelectorAll('[data-i18n="bathrooms"]').forEach(label=>{
    const textNode=[...label.parentElement.childNodes].find(node=>node.nodeType===Node.TEXT_NODE&&node.textContent.trim());
    if(textNode) textNode.textContent='5';
  });
  document.querySelectorAll('[data-i18n="landSize"]').forEach(label=>{
    const textNode=[...label.parentElement.childNodes].find(node=>node.nodeType===Node.TEXT_NODE&&node.textContent.trim());
    if(textNode) textNode.textContent='480 m²';
  });
  document.querySelectorAll('li[data-i18n="featBuilt"]').forEach(item=>{
    let construction=item.nextElementSibling;
    if(!construction||construction.dataset.propertyInfo!=='construction-year'){
      construction=document.createElement('li');
      construction.dataset.propertyInfo='construction-year';
      item.after(construction);
    }
    construction.innerHTML=d.featConstructionYear??t.en.featConstructionYear;
  });
  document.querySelectorAll('li[data-i18n="featTV"]').forEach(item=>{
    item.innerHTML=d.featTV??t.en.featTV;
    let living=item.nextElementSibling;
    if(!living||living.dataset.saleEquipment!=='living'){
      living=document.createElement('li');
      living.dataset.saleEquipment='living';
      item.after(living);
    }
    living.innerHTML=d.featLivingTV??t.en.featLivingTV;
    let bedrooms=living.nextElementSibling;
    if(!bedrooms||bedrooms.dataset.saleEquipment!=='bedrooms'){
      bedrooms=document.createElement('li');
      bedrooms.dataset.saleEquipment='bedrooms';
      living.after(bedrooms);
    }
    bedrooms.innerHTML=d.featBedroomTV??t.en.featBedroomTV;
    let barbecue=bedrooms.nextElementSibling;
    if(!barbecue||barbecue.dataset.saleEquipment!=='barbecue'){
      barbecue=document.createElement('li');
      barbecue.dataset.saleEquipment='barbecue';
      bedrooms.after(barbecue);
    }
    barbecue.innerHTML=d.featGasBarbecue??t.en.featGasBarbecue;
  });

  const zoneKeys={
    'bedroom-1':['zoneBedroom1','zoneBedroom1Info'],
    'bedroom-2':['zoneBedroom2','zoneBedroom2Info'],
    'bedroom-3':['zoneBedroom3','zoneBedroom3Info'],
    'bedroom-4':['zoneBedroom4','zoneBedroom4Info'],
    'living-tv':['zoneLiving','zoneLivingInfo'],
    kitchen:['zoneKitchen','zoneKitchenInfo'],pool:['zonePool','zonePoolInfo'],sala:['zoneSala','zoneSalaInfo']
  };
  document.querySelectorAll('[data-zone]').forEach(hotspot=>{
    const keys=zoneKeys[hotspot.dataset.zone];
    if(!keys) return;
    const title=d[keys[0]]??t.en[keys[0]];
    hotspot.dataset.title=title;
    hotspot.dataset.info=d[keys[1]]??t.en[keys[1]];
    hotspot.setAttribute('aria-label',(d.viewPhotosLabel??t.en.viewPhotosLabel)+' : '+title);
  });

  const labels=[
    ['#bedroomGallery','aria-label','galleryDialogLabel'],
    ['#zonePhotoModal','aria-label','zonePhotosDialogLabel'],
    ['#mapPhotoModal','aria-label','mapDialogLabel'],
    ['#galleryClose','aria-label','closeLabel'],
    ['#zonePhotoClose','aria-label','closeLabel'],
    ['#zonePhotoPrev','aria-label','previousPhotoLabel'],
    ['#zonePhotoNext','aria-label','nextPhotoLabel'],
    ['#planLightboxClose','aria-label','closeLabel'],
    ['#planExpand','aria-label','openPlanFullscreenLabel'],
    ['.map-photo-modal__close','aria-label','closeLabel']
  ];
  labels.forEach(([selector,attribute,key])=>{
    document.querySelectorAll(selector).forEach(element=>element.setAttribute(attribute,d[key]??t.en[key]));
  });
  document.querySelectorAll('.gallery-modal__prev').forEach(button=>button.setAttribute('aria-label',d.previousPhotoLabel??t.en.previousPhotoLabel));
  document.querySelectorAll('.gallery-modal__next').forEach(button=>button.setAttribute('aria-label',d.nextPhotoLabel??t.en.nextPhotoLabel));
  document.querySelectorAll('.gallery-modal__dot').forEach((dot,index)=>dot.setAttribute('aria-label',(d.showPhotoLabel??t.en.showPhotoLabel)+' '+(index+1)));
  document.querySelectorAll('.gallery-modal__slide img').forEach((img,index)=>img.alt='Villa Manon — '+(d.photoLabel??t.en.photoLabel)+' '+(index+1));
  document.querySelectorAll('.map-wrap img').forEach(img=>img.setAttribute('aria-label',d.enlargeMapLabel??t.en.enlargeMapLabel));

  const zoneModal=document.querySelector('#zonePhotoModal');
  if(zoneModal?.dataset.activeZone&&zoneKeys[zoneModal.dataset.activeZone]){
    const titleKey=zoneKeys[zoneModal.dataset.activeZone][0];
    const title=document.querySelector('#zonePhotoTitle');
    if(title) title.textContent=d[titleKey]??t.en[titleKey];
  }
}
function safeStorageGet(key){
  try{return window.localStorage.getItem(key)}
  catch(error){return null}
}
function safeStorageSet(key,value){
  try{window.localStorage.setItem(key,value)}
  catch(error){}
}
function applyLang(l){
  const selected=t[l]?l:'en';
  const d=t[selected];
  document.documentElement.lang=selected;
  document.documentElement.dir='ltr';
  document.title=(d.pageTitle??t.en.pageTitle);
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const k=el.dataset.i18n;
    const value=d[k]??t.en[k];
    if(value!==undefined&&value!=='') el.innerHTML=value;
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{
    const k=el.dataset.i18nPlaceholder;
    const value=d[k]??t.en[k];
    if(value!==undefined) el.placeholder=value;
  });
  safeStorageSet('villaLang',selected);
  const selector=document.querySelector('#lang');
  if(selector) selector.value=selected;
  const current=document.querySelector('#languagePickerCurrent');
  if(current) current.textContent=selected.toUpperCase();
  document.querySelectorAll('#languagePickerMenu [data-lang]').forEach(button=>{
    const active=button.dataset.lang===selected;
    button.classList.toggle('active',active);
    button.setAttribute('aria-selected',active?'true':'false');
  });
  applySaleCorrections(d);
}
const languageSelect=document.querySelector('#lang');
const languageMenu=document.querySelector('#languagePickerMenu');
if(languageSelect&&!languageSelect.querySelector('option[value="zh"]')){
  const option=document.createElement('option');
  option.value='zh';option.textContent='中文';languageSelect.appendChild(option);
}
if(languageMenu&&!languageMenu.querySelector('[data-lang="zh"]')){
  const button=document.createElement('button');
  button.type='button';button.dataset.lang='zh';button.setAttribute('role','option');button.textContent='中文';
  languageMenu.appendChild(button);
}
const saved=safeStorageGet('villaLang');
const auto=(navigator.language||'en').slice(0,2);
applyLang(saved||(['fr','th','ru','zh'].includes(auto)?auto:'en'));
document.querySelector('#lang').addEventListener('change',event=>{
  applyLang(event.target.value);
});
const languagePicker=document.querySelector('#languagePicker');
const languagePickerButton=document.querySelector('#languagePickerButton');
const languagePickerMenu=document.querySelector('#languagePickerMenu');
if(languagePicker&&languagePickerButton&&languagePickerMenu){
  const closeLanguagePicker=()=>{
    languagePicker.classList.remove('open');
    languagePickerButton.setAttribute('aria-expanded','false');
  };
  languagePickerButton.addEventListener('click',event=>{
    event.stopPropagation();
    const open=!languagePicker.classList.contains('open');
    languagePicker.classList.toggle('open',open);
    languagePickerButton.setAttribute('aria-expanded',open?'true':'false');
  });
  languagePickerMenu.querySelectorAll('[data-lang]').forEach(button=>{
    button.addEventListener('click',()=>{
      const selector=document.querySelector('#lang');
      if(selector){
        selector.value=button.dataset.lang;
        selector.dispatchEvent(new Event('change',{bubbles:true}));
      }
      closeLanguagePicker();
    });
  });
  document.addEventListener('click',event=>{
    if(!languagePicker.contains(event.target)) closeLanguagePicker();
  });
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape') closeLanguagePicker();
  });
}
const sendEmailButton=document.querySelector('#sendEmail');
if(sendEmailButton){
 sendEmailButton.setAttribute('type','button');
 sendEmailButton.addEventListener('click',(event)=>{
  event.preventDefault();

  const n=document.querySelector('#name')?.value.trim()||'Visitor';
  const e=document.querySelector('#email')?.value.trim()||'';
  const p=document.querySelector('#phone')?.value.trim()||'';
  const m=document.querySelector('#message')?.value.trim()||'I would like more information about Villa Manon.';

  const subject=`Villa Manon enquiry — ${n}`;
  const body=`Hello Lionel,

${m}

Name: ${n}
Email: ${e}
Phone / WhatsApp: ${p}`;

  const mailto=`mailto:villadreamgarden@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.assign(mailto);
 });
}

// V17 simplified interactive floor-plan explorer
(()=>{
  const stage=document.querySelector('#planStage');
  const img=document.querySelector('#planImage');
  const tabs=[...document.querySelectorAll('.plan-tab')];
  const caption=document.querySelector('#planLightboxCaption');

  // Architectural plan is the default view.
  const blueprintTab=tabs.find(t=>t.dataset.plan==='blueprint');
  tabs.forEach(t=>{
    const active=t===blueprintTab;
    t.classList.toggle('active',active);
    t.setAttribute('aria-selected',active?'true':'false');
  });
  if(img?.dataset.blueprint) img.src=img.dataset.blueprint;
  stage?.classList.add('blueprint-mode');
  if(caption) caption.textContent='Villa Manon — Blueprint';

  tabs.forEach(tab=>tab.addEventListener('click',()=>{
    if(tab.classList.contains('active')) return;
    tabs.forEach(t=>{
      const active=t===tab;
      t.classList.toggle('active',active);
      t.setAttribute('aria-selected',active?'true':'false');
    });
    stage.classList.add('switching');
    const mode=tab.dataset.plan;
    setTimeout(()=>{
      img.src=img.dataset[mode];
      stage.classList.toggle('blueprint-mode',mode==='blueprint');
      stage.classList.remove('switching');
      if(caption) caption.textContent='Villa Manon — '+(mode==='blueprint'?'Blueprint':'3D Design');
    },180);
  }));

  const allPhotos=[...document.querySelectorAll(
    '#galleryTrack .gallery-modal__slide img'
  )].map(image=>image.currentSrc||image.src).filter(Boolean);

  const poolPhotos=[
    ...document.querySelectorAll('.gallery-grid img[alt="Villa pool"], .gallery-grid img[alt="Villa Manon private pool"]')
  ].map(image=>image.currentSrc||image.src).filter(Boolean);

  [allPhotos[5],allPhotos[6]].forEach(photo=>{
    if(photo && !poolPhotos.includes(photo)) poolPhotos.push(photo);
  });

  const salaPhotos=[allPhotos[5],allPhotos[6]].filter(Boolean);

  const zonePhotos={
    'bedroom-1':{titleKey:'zoneBedroom1',indexes:[15,16,17,18,25,26]},
    'bedroom-2':{titleKey:'zoneBedroom2',indexes:[19,20,21,22,27]},
    'bedroom-3':{titleKey:'zoneBedroom3',indexes:[23,24,28]},
    'bedroom-4':{titleKey:'zoneBedroom4',indexes:[15,19,23,25,27,28]},
    'living-tv':{titleKey:'zoneLiving',indexes:[7,8,13,14]},
    'kitchen':{titleKey:'zoneKitchen',indexes:[9,10,11,12]},
    'pool':{titleKey:'zonePool',sources:poolPhotos},
    'sala':{titleKey:'zoneSala',sources:salaPhotos}
  };

  const modal=document.querySelector('#zonePhotoModal');
  const modalImage=document.querySelector('#zonePhotoImage');
  const modalTitle=document.querySelector('#zonePhotoTitle');
  const modalCounter=document.querySelector('#zonePhotoCounter');
  const dotsWrap=document.querySelector('#zonePhotoDots');
  const closeButton=document.querySelector('#zonePhotoClose');
  const previousButton=document.querySelector('#zonePhotoPrev');
  const nextButton=document.querySelector('#zonePhotoNext');

  let activePhotos=[];
  let activeIndex=0;
  let zoneStartX=0;

  function renderZonePhoto(){
    if(!activePhotos.length) return;

    modalImage.src=activePhotos[activeIndex];
    const translations=t[document.documentElement.lang]??t.en;
    modalImage.alt=modalTitle.textContent+' — '+(translations.photoLabel??t.en.photoLabel)+' '+(activeIndex+1);
    modalCounter.textContent=(activeIndex+1)+' / '+activePhotos.length;

    [...dotsWrap.children].forEach((dot,index)=>{
      dot.classList.toggle('active',index===activeIndex);
    });
  }

  function openZone(zone){
    const selection=zonePhotos[zone];
    if(!selection) return;

    activePhotos=selection.sources
      ? [...selection.sources]
      : selection.indexes.map(index=>allPhotos[index]).filter(Boolean);

    if(!activePhotos.length) return;

    activeIndex=0;
    const translations=t[document.documentElement.lang]??t.en;
    modal.dataset.activeZone=zone;
    modalTitle.textContent=translations[selection.titleKey]??t.en[selection.titleKey];

    dotsWrap.innerHTML='';

    activePhotos.forEach((_,index)=>{
      const dot=document.createElement('button');
      dot.type='button';
      dot.className='zone-photo-modal__dot';
      dot.setAttribute('aria-label',(translations.showPhotoLabel??t.en.showPhotoLabel)+' '+(index+1));
      dot.addEventListener('click',()=>{
        activeIndex=index;
        renderZonePhoto();
      });
      dotsWrap.appendChild(dot);
    });

    renderZonePhoto();
    modal.classList.add('open');
    modal.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden';
    closeButton.focus();
  }

  function closeZone(){
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden','true');
    document.body.style.overflow='';
    modalImage.removeAttribute('src');
  }

  function stepZone(step){
    if(!activePhotos.length) return;
    activeIndex=(activeIndex+step+activePhotos.length)%activePhotos.length;
    renderZonePhoto();
  }

  document.querySelectorAll('#planHotspots .hotspot').forEach(hotspot=>{
    hotspot.addEventListener('click',event=>{
      event.preventDefault();
      if(!window.matchMedia('(min-width:1025px)').matches) return;
      openZone(hotspot.dataset.zone);
    });
  });

  closeButton.addEventListener('click',closeZone);
  previousButton.addEventListener('click',()=>stepZone(-1));
  nextButton.addEventListener('click',()=>stepZone(1));

  modal.addEventListener('click',event=>{
    if(event.target===modal) closeZone();
  });

  modalImage.addEventListener('pointerdown',event=>{
    zoneStartX=event.clientX;
    if(modalImage.setPointerCapture){
      modalImage.setPointerCapture(event.pointerId);
    }
  });

  modalImage.addEventListener('pointerup',event=>{
    const delta=event.clientX-zoneStartX;
    if(Math.abs(delta)>45) stepZone(delta<0?1:-1);
  });

  let zoneTouchStartX=0;
  let zoneTouchStartY=0;

  modalImage.addEventListener('touchstart',event=>{
    const touch=event.changedTouches[0];
    zoneTouchStartX=touch.clientX;
    zoneTouchStartY=touch.clientY;
  },{passive:true});

  modalImage.addEventListener('touchend',event=>{
    const touch=event.changedTouches[0];
    const deltaX=touch.clientX-zoneTouchStartX;
    const deltaY=touch.clientY-zoneTouchStartY;

    if(Math.abs(deltaX)>50 && Math.abs(deltaX)>Math.abs(deltaY)){
      stepZone(deltaX<0?1:-1);
    }
  },{passive:true});

  document.addEventListener('keydown',event=>{
    if(!modal.classList.contains('open')) return;
    if(event.key==='Escape') closeZone();
    if(event.key==='ArrowLeft') stepZone(-1);
    if(event.key==='ArrowRight') stepZone(1);
  });

  // Fullscreen viewer for both the architectural plan and the 3D plan:
  // zoom + drag/pan with mouse, finger and stylus.
  const lb=document.querySelector('#planLightbox');
  const lbImg=document.querySelector('#planLightboxImage');
  let scale=1;
  let panX=0;
  let panY=0;
  let dragging=false;
  let startX=0;
  let startY=0;
  let startPanX=0;
  let startPanY=0;
  let pinchStartDistance=0;
  let pinchStartScale=1;

  function clampPan(){
    if(scale<=1){
      panX=0;
      panY=0;
      return;
    }
    const maxX=Math.max(0,(lbImg.clientWidth*scale-lb.clientWidth)/2);
    const maxY=Math.max(0,(lbImg.clientHeight*scale-lb.clientHeight)/2);
    panX=Math.max(-maxX,Math.min(maxX,panX));
    panY=Math.max(-maxY,Math.min(maxY,panY));
  }

  function renderPlanTransform(animate=false){
    clampPan();
    lbImg.style.transition=animate?'transform .18s ease':'none';
    lbImg.style.transform=`translate3d(${panX}px,${panY}px,0) scale(${scale})`;
    lbImg.style.cursor=scale>1?(dragging?'grabbing':'grab'):'zoom-in';
  }

  function setScale(v,animate=true){
    scale=Math.max(1,Math.min(5,v));
    if(scale===1){
      panX=0;
      panY=0;
    }
    renderPlanTransform(animate);
  }

  function resetPlanView(){
    scale=1;
    panX=0;
    panY=0;
    dragging=false;
    renderPlanTransform(true);
  }

  document.querySelector('#planExpand').addEventListener('click',()=>{
    lbImg.src=img.src;
    lb.classList.add('open');
    lb.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden';
    requestAnimationFrame(resetPlanView);
  });

  function closeLB(){
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden','true');
    document.body.style.overflow='';
    resetPlanView();
  }

  document.querySelector('#planLightboxClose').addEventListener('click',closeLB);
  lb.addEventListener('click',e=>{if(e.target===lb)closeLB();});
  document.querySelector('#planZoomIn').addEventListener('click',()=>setScale(scale+.5));
  document.querySelector('#planZoomOut').addEventListener('click',()=>setScale(scale-.5));
  document.querySelector('#planZoomReset').addEventListener('click',resetPlanView);

  lbImg.addEventListener('dblclick',event=>{
    event.preventDefault();
    setScale(scale===1?2.5:1);
  });

  lbImg.addEventListener('pointerdown',event=>{
    if(scale<=1) return;
    if(event.pointerType==='mouse' && event.button!==0) return;
    dragging=true;
    startX=event.clientX;
    startY=event.clientY;
    startPanX=panX;
    startPanY=panY;
    lbImg.setPointerCapture?.(event.pointerId);
    renderPlanTransform(false);
    event.preventDefault();
  });

  lbImg.addEventListener('pointermove',event=>{
    if(!dragging || scale<=1) return;
    panX=startPanX+(event.clientX-startX);
    panY=startPanY+(event.clientY-startY);
    renderPlanTransform(false);
    event.preventDefault();
  });

  function stopPlanDrag(event){
    if(!dragging) return;
    dragging=false;
    if(event && lbImg.hasPointerCapture?.(event.pointerId)){
      lbImg.releasePointerCapture(event.pointerId);
    }
    renderPlanTransform(true);
  }

  lbImg.addEventListener('pointerup',stopPlanDrag);
  lbImg.addEventListener('pointercancel',stopPlanDrag);
  lbImg.addEventListener('pointerleave',event=>{
    if(event.pointerType==='mouse') stopPlanDrag(event);
  });

  lbImg.addEventListener('touchstart',event=>{
    if(event.touches.length===2){
      pinchStartDistance=Math.hypot(
        event.touches[0].clientX-event.touches[1].clientX,
        event.touches[0].clientY-event.touches[1].clientY
      );
      pinchStartScale=scale;
      event.preventDefault();
    }
  },{passive:false});

  lbImg.addEventListener('touchmove',event=>{
    if(event.touches.length===2 && pinchStartDistance>0){
      const distance=Math.hypot(
        event.touches[0].clientX-event.touches[1].clientX,
        event.touches[0].clientY-event.touches[1].clientY
      );
      scale=Math.max(1,Math.min(5,pinchStartScale*(distance/pinchStartDistance)));
      renderPlanTransform(false);
      event.preventDefault();
    }
  },{passive:false});

  lbImg.addEventListener('touchend',()=>{
    pinchStartDistance=0;
    if(scale<1.05) resetPlanView();
    else renderPlanTransform(true);
  },{passive:true});

  window.addEventListener('resize',()=>renderPlanTransform(false));

  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&lb.classList.contains('open')) closeLB();
  });
})();
