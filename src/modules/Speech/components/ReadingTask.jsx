import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const ReadingTask = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get age from location state or default to 8
  const initialAge = location.state?.selectedAge || 8;
  const [childAge, setChildAge] = useState(initialAge);
  const [selectedAge6Story, setSelectedAge6Story] = useState(null);
  const [selectedAge7Story, setSelectedAge7Story] = useState(null);
  const [selectedAge8Story, setSelectedAge8Story] = useState(null);
  const [selectedAge9Story, setSelectedAge9Story] = useState(null);
  const [selectedAge10Story, setSelectedAge10Story] = useState(null);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  // Update age when location state changes
  useEffect(() => {
    if (location.state?.selectedAge) {
      setChildAge(location.state.selectedAge);
    }
  }, [location.state]);

  // Age 6 story blocks
  const age6Stories = [
    `ගිරවා ලස්සන කුරුල්ලෙකි.

ගිරවාගේ ඇඟ කොළ පාටයි. 

වකුටු හොට රතු පාටයි. 

බෙල්ලේ රතු පාට මාලයක් තිබේ. 

ඌ පළතුරු සහ ධාන්‍ය වර්ග ආහාරයට ගනියි.

ගිරවා සුරතලයට ගෙවල්වල ඇති කරයි.`,

    `සිංහයා කැලයේ රජු ලෙස හැඳින්වේ.

ඌ විශාල ශක්තිමත් සතෙකි.

සිංහයාගේ කෙස් වැටිය ඉතා ඝනකමයි.

ඌ මස් අනුභව කරන මාංශ භක්ෂකයෙකි.`,

    `ඇතා ලොව සිටින විශාලතම ගොඩබිම සතාය.

ඌට දිගු හොඬවැලක් සහ විශාල කන් ඇත.

ඇතා සාමාන්‍යයෙන් ශාක භක්ෂකයෙකි.

ඌ ඉතා බුද්ධිමත් සතෙකු ලෙස සැලකේ.`,

    `පුසා සුරතල් කිරීමට ප්‍රිය කරන සතෙකි.

ඌට ඉතා මෘදු ලොම් සහ තියුණු නියපොතු ඇත.

පුසා මීයන් ඇල්ලීමට දක්ෂයෙකි.

ඌ බොහෝ වේලාවක් නිදා ගැනීමට කැමතියි.`,

    `ජිරාෆ් සතාට ඉතා දිගු ගෙලක් ඇත.

ඌ ගසක උසම අතු වලින් කොළ කයි.

එහි සම කහ සහ දුඹුරු පැහැ ලප වලින් යුක්තයි.

ජිරාෆ් අප්‍රිකාවේ වාසය කරන සතෙකි.`,

    `තාරාවා ජලයේ පිහිනීමට ප්‍රිය කරයි.

ඌට ජලයේ ගමන් කිරීමට උපකාරී වන පාද ඇත.

තාරාවන්ගේ ශරීරය පිහාටු වලින් වැසී ඇත.

ඌ බොහෝ විට ගොවිපලවල් වල දැකිය හැකිය.`
  ];

  // Age 7 story blocks
  const age7Stories = [
    `🐒 වඳුරාගේ කතාව
ගමේ කැලේ විශාල ගසක් තිබුණා. ඒ ගසේ ජීවත් වුණේ නපුරු වඳුරෙක්. දවසක් වඳුරා ගස් අත්තක වාඩි වී ඉන්න විට ගෙඩි කන කුඩා ලේනෙක් දැක්කා. වඳුරා ලේනාට ගෙඩිය උදුරා ගැනීමට පැන ගත්තා. ලේනා ඉක්මනට පැන ගියා. ලේනා බේරුණේ ඒ කුඩා අතු අතරේ රිංගා යන්නට ලැබුණු නිසයි. වඳුරාට ලේනාව අල්ල ගන්න බැරි වුණා. අන්තිමේදී වඳුරා කළ වැරැද්ද තේරුම් ගත්තා.`,

    `🌞 ඉර එළිය 
උදේට ඉර පායලා රන් කැන් වැටෙනවා රතු පාටින් අහස පාට කරලා එනවා ගස් වැල් මුදුනට ඉර එළිය වැටෙනවා පුංචි මටත් එළිය දී පාසල් යන්න කියා දෙනවා

නැවතත් හවසට රන්වන් පාටින් දිලෙනවා දවස ගෙවී ගිහින් රෑ එළඹෙනවා ඉර රැස් අහස පුරා විසිරී යනවා හෙටත් දවසක් එළි කරන්න පොරොන්දු වෙනවා.`,

    `🐻 වලස් පැටියා සහ මී පැණි 
වලස් පැටියෙක් දවසක් කැලේ ඇවිද ගියා. ඌට මී මැසි වදයකින් වැගිරෙන මී පැණි සුවඳ දැනුණා. මී පැණි කන්න ආසාවෙන් වලස් පැටියා ගසට නැග්ගා. වදේ ළඟට ගිය විට මී මැස්සෝ එළියට ආවා. ඔවුන් වලස් පැටියාට දෂ්ට කළා. වලස් පැටියා වේදනාවෙන් කෑ ගසමින් බිමට බැස්සා. වලස් පැටියා තේරුම් ගත්තා අනුන්ගේ දේ බලෙන් ගන්න හොඳ නැති බව.`,

    `🪁 සරුංගලේ 
සරුංගලේ! සරුංගලේ! නූල් ඇදගෙන ඉහළ යන රතු නිල් පාටින් හැඩ වුණ අහසෙ පාවෙන සරුංගලේ!

අපි දුවද්දි වේගයෙන් ඔබත් යනවා ඉහළටම සුළඟට ඔබ නටන හැටි බලන් ඉන්න මං ආසයි!`,

    `🏡 කුඩා ගෙදර 
මමයි, නංගියි, මල්ලියි එක්ක සෙල්ලම් කරන්න ගෙයක් හැදුවා. අපි පොල් අතු කීපයක් එකතු කර ගත්තා. ගෙයි බිත්ති හැදුවේ රෙදි වලින් සහ දඬු වලින්. අපේ ගෙදරට පුංචි දොරක් සහ ජනේල දෙකක් තිබුණා. නංගී මල් ගෙනත් ජනේල අලංකාර කළා. මල්ලී වැලි වලින් මිදුල හැදුවා. හැමෝම එකතු වෙලා වැඩ කරපු නිසා ලස්සන සෙල්ලම් ගෙයක් හැදෙන්න වැඩි වෙලාවක් ගියේ නැහැ.`,

    `🦝 බළලා සහ මීයා 
පොඩි ගෙදරක හරිම නපුරු බළලෙක් හිටියා. ඌ හැමදාම මීයන් පසුපස දිව්වා. දවසක් මීයෙක් කුස්සියේ බත් පිඟාන ළඟට ආවා. බළලා සෙමින් සෙමින් බිත්තිය දිගේ බඩ ගෑවා. මීයාට බළලා එනවා පෙනුණේ නැහැ. බළලා එක පාරටම පැනලා මීයා අල්ල ගත්තා. ඒත් මීයා බළලාට හපලා බේරිලා ගියා. එදා ඉඳලා බළලා හැම මීයෙක්ටම ලඟට යන්න බය වුණා.`,

    `🐘 ඇත් පැටියා සහ මිතුරා 
පුංචි ඇත් පැටියෙක් කැලේදී තනියම ඇඬුවා. ඌට අම්මා අතරමං වෙලා. ඌ තැන් තැන්වල ඇවිද ගියා. එකපාරටම ඌට පොඩි හාවෙක් හම්බ වුණා. ඇත් පැටියා ඇයි අඬන්නේ කියලා හාවා ඇහුවා. හාවා ඇත් පැටියාට උදව් කරන්න පොරොන්දු වුණා. දෙන්නා එකතු වෙලා කැලේ පුරා ඇත් මව සෙව්වා. ටික වෙලාවකින් ඇත් මව හම්බ වුණා. එදා ඉඳලා ඇත් පැටියා සහ හාවා හොඳම යාළුවෝ වුණා.`
  ];

  // Age 8 story blocks
  const age8Stories = [
    `මැස්සෙකුයි, ගෙම්බෙකුයි, ඉත්තෑවෙකුයි, කුකුළෙකුයි ගස් කොටයක් උඩ ගෙයක් හදාගෙන උන්නා.මැස්සගෙ නම රුංරුං පංචා. ගෙම්බගෙ නම බක බක අප්පුහාමි. ඉත්තෑවගෙ නම ඉඳිකටු මුදියන්සෙ. කුකුළාගෙ නම හඬලන රාල.
දවසක් දා හතර දෙනා කැලෑවක් මැදින් ගමනක් ගියා. හතු, මල්, ගෙඩි ජාති, දර එකතු කරන්න. රුංරුං පංචා යාළුවො තුන් දෙනාගෙ ඔළු උඩින් පියාසර කෙරුවා.
ඉතිං ඔහොම ගිහින්, ගිහින් මේ හතර දෙනා ම ගස් කොළං නැති පාළු පිට්ටනියකට ආවා. එතන පුංචි කරත්තයක් තිබෙනවා දැක්කා. කරත්තෙට සවි කරල තිබුණෙ එකට එක නොගැළපෙන රෝද, පළමුවෙනි රෝදෙ බොහොම කුඩා එකක්. දෙවෙනි රෝදෙ තරමක් ලොකුයි. තුන්වෙනි රෝදෙ ඊට ලොකුයි. හතරවෙනි රෝදෙ මහ විශාලයි.යාළුවො පුදුම වෙලා කරත්තෙ දිහා බලාගෙන ඉන්නකොට, ළඟ තිබුණ පඳුරකින් හාවෙක් එළියට පැන්නා. එයත් කරත්තෙ දිහා බලලා හිනා වෙනවා. හාවාගෙ නම පිනුම් හාමි." මේ කරත්තෙ ඔයාගෙ ද?" කියලා යාළුවොහතර දෙනා පිනුම් හාමිගෙන් ඇහුවා."නෑ. ඒක වලස් හාමිගෙ කරත්තෙ. වලස් හාමි ඔය කරත්තෙ හදන්න බොහොම මහන්සි ගත්තා. නමුත් එයාට ඒක හදල ඉවර කරන්ට බැරි වුණා" කියලා පිනුම් හාමි කිවුවා.`,

    `🦉 බකමූණාගේ පාසල
ගම මැද විශාල නුග ගසක් තිබුණා. දවසක් දා එතන අලුත් පාසලක් පටන් ගත්තා. පාසලේ ගුරුවරයා වූයේ බකමූණා මාමා. බකමූණා මාමා හරිම බුද්ධිමත්. ඌ උගන්වන්න ලෑස්ති වුණේ, රාත්‍රියේ පමණයි. ඉතිං පාසලට ආවේ වවුලෙක්, හිවලෙක්, අලියෙක් සහ තවත් රාත්‍රියට අවදිව සිටින සතුන් කීප දෙනෙක්. ඔවුන් හැමෝම පාසලට ආවේ පොත්පත්, පෑන්, පැන්සල් අරගෙන.

බකමූණා මාමා, හැමෝගෙම ඔළු උඩින් පියාඹලා ගණන් උගන්වන්න පටන් ගත්තා. "එකයි එකයි කීයද?" හිවලා උත්තර දුන්නා, "දෙකයි!" අලියා ඇහුවා, "ඇයි අපි රෑට විතරක් පාසල් එන්නේ?" බකමූණා මාමා සිනාසුණා. "මොකද දවල්ට ඉර එළියේදී මට නින්ද යනවා!" කියලා ඌ උත්තර දුන්නා. හැමෝම සිනාසුණා.`,

    `🐢 ඉබ්බා සහ කූඩුව
ගඟ අයිනේ මඩ සහිත පොළොවක කුඩා ඉබ්බෙක් ජීවත් වුණා. ඌට තිබුණේ හරිම ලස්සන කටුවක්. ඌ හිතුවේ, "මේක තමා ලෝකේ තියෙන ලස්සනම දෙය." දවසක් ඉබ්බා තනියම ඇවිදගෙන යනකොට ලොකු කූඩුවක් හම්බ වුණා. ඒ කූඩුවේ ලස්සන රන්වන් පාටින් දිලෙන කුරුල්ලෙක් හිටියා. කුරුල්ලා උඩට පැන පැන දඟලනවා.

ඉබ්බා කූඩුව ළඟට ගිහින් ඇහුවා, "ඇයි ඔයා මෙච්චර ලස්සනට ඉඳලා දුක් වෙන්නේ?" කුරුල්ලා කිව්වා, "මම මෙතන හිර වෙලා ඉන්නේ. මට ඕනෙ මගේ යාළුවෝ එක්ක අහසේ නිදහසේ පියාඹන්න." ඉබ්බාට පුදුම හිතුණා. තමාගේ කටුව තමාගේ ආරක්ෂාවට මිස හිරවෙන්න නොවන බව ඉබ්බා තේරුම් ගත්තා.`,

    `🐻 පොලුව සහ කොට්ටෙයියා
වලස් පැටියෙක් සහ කුඩා කොට්ටෙයියෙක් හොඳම යාළුවෝ. ඔවුන් දෙදෙනා එකතුවෙලා ගමනක් යන්න ලෑස්ති වුණා. වලස් පැටියා හිතුවා, "මට ගමන යන්න කරත්තයක් ඕනේ." කොට්ටෙයියා කිව්වා, "මට පියාඹන්න පියාපත් ඕනේ." කොට්ටෙයියා තමාගේ පොඩි නියපොතු වලින් අතු කීපයක් එකතු කළා. වලස් පැටියා ඒවා එකට එකතු කරලා කරත්තයක් හැදුවා.

වලස් පැටියා කරත්තෙට ලොකු රෝද දෙකක් සවි කළා. කොට්ටෙයියා කරත්තෙට පුංචි රෝද දෙකක් සවි කළා. කරත්තය අමුතු විදිහට හැඩ වෙලා තිබුණා. කොට්ටෙයියා කරත්තෙට උඩින් පියාඹලා ගියා. වලස් පැටියා කරත්තෙ අදිනවා. කොට්ටෙයියා කෑ ගැහුවා, "යාළුවෝ දෙන්නෙක් එකට වැඩ කළොත් බැරි දෙයක් නෑ!"`,

    `🦏 රයිනෝ සහ මල් වත්ත
පුංචි රයිනෝ කෙනෙක් දවසක් දා හරිම ලස්සන මල් වත්තක් දැක්කා. වත්ත වටේ ලොකු වැටක් ගහලා තිබුණා. මල් වත්ත මැද ලොකු ගලක් තිබුණා. ඒ ගල උඩින්, වත්තේ අයිතිකරු වූ කුඩා ගිරවෙක් මල් වතුර දානවා. රයිනෝ හිතුවා, "මට මේ මල් වත්තට ඇතුළු වෙන්න ඕනේ." ඌ අර වැට කඩලා ඇතුළු වෙන්න හැදුවා.

රයිනෝ වේගයෙන් වැටට පහර දුන්නා. ඒත් වැට කැඩුණේ නැහැ. ඌට හරිම කේන්ති ගියා. ගිරවා සිනාසෙමින් කෑ ගැහුවා, "අනේ, රයිනෝ! වැට කඩන්න එපා! වටේ යන්න දොරක් තියෙනවා." රයිනෝ වටේ බලනකොට පුංචි ගේට්ටුවක් තිබුණා. රයිනෝ තේරුම් ගත්තා, කෝපය වෙනුවට බුද්ධියෙන් වැඩ කළ යුතු බව.`,

    `🐇 හාවාගේ ගමන
හාවෙක් සහ පොඩි ඉත්තෑවෙක් දුර ගමනක් යන්න ලෑස්ති වුණා. හාවා හිතුවා, "මම වේගයෙන් දුවන නිසා මට ඉක්මනට යන්න පුළුවන්." ඉත්තෑවා හිතුවා, "මම හිමීට යන නිසා කැලේ විස්තර බලාගෙන යන්න පුළුවන්." ගමන පටන් ගන්න කලින් හාවා තමාගේ කකුල් දෙක දිහා බැලුවා. ඉත්තෑවා තමාගේ කටු දිහා බැලුවා.

දෙන්නම එකට ගමන පටන් ගත්තා. හාවා වේගයෙන් දිව්වා. ඌට මහන්සි වෙලා විවේක ගන්න ඕනෙ වුණා. ඉත්තෑවා නිකරුණේ ඉක්මන් නොවී සෙමින් සෙමින් ඇවිද ගියා. ගමනාන්තයට ළඟා වූ විට හාවා දැක්කේ ඉත්තෑවා දැනටමත් එතන ඉන්නවා. ඉත්තෑවා හිනා වෙලා කිව්වා, "හයියෙන් දුවනවාට වඩා වැදගත් වෙන්නේ නියමිත වෙලාවට වැඩ කිරීම."`,

    `🐒 වඳුරන්ගේ අලුත් ගෙය
වඳුරෝ තුන් දෙනෙක් ගසක් උඩ සෙල්ලම් කරමින් හිටියා. එක් වඳුරෙක් කිව්වා, "අපි මේ අතු උඩ අපිට ගෙයක් හදමු!" අනිත් වඳුරෝ දෙන්නා කැමති වුණා. ඔවුන් මුලින්ම ලොකු දඬු කීපයක් එකතු කර ගත්තා. ඊට පස්සේ පුංචි පුංචි කොළ අතු එකතු කරලා වහලක් හැදුවා. ඒත් ගෙය ගහට තදින් සවි වුණේ නැහැ.

ගෙය හදල ඉවර වෙනකොට, ලොකු සුළඟක් ආවා. සුළඟට ගෙය කඩාගෙන යන්න පටන් ගත්තා. වඳුරෝ තුන් දෙනාම ගෙයට බැන බැන බිමට පැන්නා. ඔවුන්ගේ ගෙය කඩා වැටුණා. ඔවුන් ඉගෙන ගත්තා, ඕනෑම වැඩක් ඉක්මන් නොවී, හොඳට සැලසුම් කරලා කරන්න ඕනෙ බව.`,

    `🐟 මාළුවා සහ මකරා (කෙටි කතාව)
ගඟ මැද ලස්සන නිල් පාට මාළුවෙක් හිටියා. ඌට තිබුණේ දිලිසෙන කොරපොතු. දවසක් ඌට ගඟෙන් එළියට ආපු මකරෙක් හමු වුණා. මකරාගේ ඇඟ රතු පාටයි. මකරා කෑ ගැහුවා, "මම තමා ලොකුම සහ ශක්තිමත්ම සතා!" මාළුවා සිනාසුණා.

මාළුවා කිව්වා, "මකරා, මට පුළුවන් ඔයාට බැරි දෙයක් කරන්න." මකරා පුදුම වුණා. "ඒ මොකක්ද?" කියලා ඇහුවා. මාළුවා ඉක්මනින් ම ගැඹුරු දිය යටට කිමිදුණා. මකරාට දිය යටට යන්න බැරි වුණා. මකරාට තේරුම් ගියා, හැමෝටම තමන්ටම ආවේණික ශක්තියක් ඇති බව.`,

    `🦊 හිවලාගේ විහිළුව
කැලේ පුංචි හිවලෙක් ජීවත් වුණා. ඌ හැම වෙලේම අනිත් සතුන්ට විහිළු කළා. ඌ දවසක් ගෙම්බෙක්ට සහ කුකුළෙක්ට බොරු කිව්වා, "අපේ ගමේ විශාල කේක් ගෙඩියක් තිබෙනවා, හැමෝටම කන්න පුළුවන්!" ගෙම්බා සහ කුකුළා හරිම සතුටු වුණා.

තුන් දෙනාම ගමට ගියා. එතන කේක් ගෙඩියක් තිබුණේ නැහැ. ගෙම්බාට සහ කුකුළාට හරිම දුක හිතුණා. හිවලා හිනා වුණා. කුකුළා කිව්වා, "නපුරු විහිළු කරන්න එපා." ගෙම්බා කිව්වා, "ඔයාට කවදාවත් විශ්වාස කරන්න බැහැ." එදා ඉඳලා හිවලාට යාළුවෝ හිටියේ නැහැ.`
  ];

  // Age 9 and 10 story blocks (same stories for both ages)
  const age9Stories = [
    `සතියේ දවස් පහ පාසල් යන අත්තම්මලා සිටිති. සිය දූ දරුවන්ගේ දරුවන් කැටුව නැවත පාසල් යන මේ අත්තම්මලා වගේ ම ලිලී අත්තම්මා ද දරුවන්ට ආදරේ ය. එහෙත් ඇය දිනපතා පාසලට එන්නේ ද යන්නේ ද තනිව ම ය. උදෑසන හයට පමණ පාසල අබිමුවට එන ඇය එතැන් සිට සිය දෛනික රාජකාරිය අරඹන්නී ය. ඇය නමින් ලිලී වයලට් ය. කෑගල්ලේ පරගම්මන ඈ උපන් ගම් පියසයි. මේ ' ලිලී අම්මා ' හෙවත් 'වයලට් ආච්චි' පාසලට පැමිණියේ අමුතු ම රාජකාරියකට ය. පොලීසියේ හෝ වෙනත් ආරක්ෂක අංශයක සේවාවක් නොවෙතත් නිල නොලත් එවැනි ම රාජකාරියක ඇය නියැලෙනුයේ ස්වේච්ඡාවෙන් ම ය. උදේ ම සේවයට එන ඇය, පාසලට එන දරුවන් ආරක්ෂිතව පාර මාරු කරවයි. පාසල් බස් රථ, වෑන් රථ මෙන් ම පාසලට ඉදිරියෙන් එහා මෙහා යන වෙනත් වාහන ද කඩිසරව හසුරුවාලයි.දරුවන්ගේ රැකවරණය පතා විටෙක සිය දැඩි අණසක පතුරන ඇගේ මේ සේවය ඒ කාටත් පහසුවකි. ඕ තොමෝ දරුවන්ට මෙන් ම වැඩිහිටියන්ට මාර්ග නීති මතක් කර දෙයි. ඇතැම් නොහික්මුණු රියැදුරකුට තදින් අවවාද කරන්නට වුව ද ඇය නොපැකිළෙයි. එහෙත් දරුවන්ට කරුණාවෙන් මග පෙන්වයි. සේවය ම සිය 'රාජකාරිය ́ කර ගත් මේ අපූරු අත්තම්මා වයස අවුරුදු අසූව ඉක්මවා තිබියදීත් විශ්‍රාම නොගත්තා ය. පුරා අවුරුදු හතළිහකට වැඩි කාලයක් ඇය එක දිගට දරුවන් වෙනුවෙන් කැප වූ මුත් මේ අත්තම්මාගේ රාජකාරියට මාසික වැටුප් නැත; කිසිදු දීමනාවක් නැත; පාසල පැවැත්වෙන සැම දවසක ම ඈ සුපුරුදු රාජකාරියේ ය. ප්‍රමාද වී පැමිණීම් හෝ කෙටි නිවාඩු ද නැත. උදේ හයේ සිට නවයයි තිහ වන තෙක් ද, දහවල් දොළහේ සිට සවස තුනයි තිහ වන තෙක් ද තමා ම සකසා ගත් කාලසටහනකට අනුව ඈ දිනපතා සේවයේ නියැලෙන්නී ය. අමතර සවස පන්ති හෝ ක්‍රීඩා පුහුණුවීම් ආදිය පැවැත්වෙද්දී සවස පහ පසු වන තුරු ඈ පාසලේ ගේට්ටුව ළඟ ය.`,

    `🚴 සයිකලයේ රාලහාමි
නගරයේ තිබුණු කාර්යබහුල ම මංසන්ධියේ වාහන තදබදය සෑම දිනකම ලොකු ප්‍රශ්නයක් විය. පොලිස් නිලධාරීන් කීප දෙනෙකුට වුවද ඒ සියල්ල පාලනය කරගැනීමට අපහසු විය. එහෙත් මේ තදබදය ඉතා පහසුවෙන් නිරාකරණය කරන අපූරු මහත්මයෙක් සිටියේ ය. ඔහු "සයිකලයේ රාලහාමි" ලෙස ප්‍රසිද්ධ විය. ඔහු සෑම උදෑසනකම පාහේ සයිකලයකින් මංසන්ධියට පැමිණ, සිය නිල ඇඳුම පිරිසිදුව ඇඳගෙන, අතේ වූ පුංචි සංඥා ධජයක් භාවිතයෙන් වාහන පාලනය කළේ ය. විශාල වාහන අතරින් පවා ඉතා වේගයෙන් සයිකලය පදවාගෙන යන ඔහුගේ දක්ෂතාව නිසා ඔහු ඉතා ඉක්මනින් ජනප්‍රිය විය. ඔහු දරුවන්ට සහ පාසල් යන සිසුන්ට පාර මාරු වීමට වැඩි අවස්ථාවක් ලබා දුන්නේ ය. දිනක් වේගයෙන් ආ මෝටර් රථයක් තදින් නතර කර, රියැදුරුට මාර්ග නීති වල වැදගත්කම පැහැදිලි කිරීමට ද ඔහු නොපැකිලුණි. ඔහු කිසිදු නිල තනතුරක් නොමැතිව, තමාගේ කැමැත්තෙන් ම මෙම සේවය කළේ ය.`,

    `🌊 පුංචි දිය නාගයා
ගඟ අයිනේ තිබූ ලොකු අතු ඉති වලින් වට වූ විහාරස්ථානයක් අසල ඉතා කාරුණික දිය නාගයෙක් ජීවත් විය. නාගයා දිනපතා ගඟට පැමිණ විහාරස්ථානයේ දාන ශාලාවට වතුර ටිකක් ගෙන ගියේ ය. ඔහුට කුඩා කළඳක ප්‍රමාණයට ජලය ගෙන යාමට හැකි විය. ගමේ මිනිස්සු මේ නාගයාට "පුංචි නාගයා" කියා ආදරයෙන් ඇමතූහ. එක් දිනක් ගඟට නාන්නට පැමිණි දරුවෙක් ගලක පැටලී ගඟේ ගිලෙන්නට ගියේ ය. නාගයාට ක්ෂණිකව සිතුණේ දරුවා බේරා ගත යුතු බව ය. කිසිවෙකුටත් නොදැනෙන්නට දරුවා වටා දඟලමින්, නාගයා දරුවා ගොඩට තල්ලු කර දැමුවේ ය. දරුවා බේරී ගොඩට පැමිණි විට මිනිස්සු නාගයාට ස්තුති කළේ ආදරයෙනි. නාගයා තම දෛනික කාරුණික සේවාවට අමතරව තවත් ජීවිතයක් බේරා ගත්තේ ය.`,

    `👵 ගමේ වෙද හාමිනේ
කන්ද උඩ ගමේ ජීවත් වූ අයියෝ වෙද හාමිනේ වයස අවුරුදු අනූවට කිට්ටු වුව ද තවමත් තරුණියක මෙන් සේවය කළා ය. ඇය කිසිදු පාසලකට හෝ වෛද්‍ය විද්‍යාලයකට නොගිය ද, තම ආච්චිගෙන් උගත් පාරම්පරික දැනුම උපයෝගී කරගෙන ගමේ සියලු දෙනාගේ රෝග සුව කළා ය. දිනපතාම ඇගේ කුඩා නිවස ඉදිරිපිට ගමේ මිනිසුන් පෝලිමේ සිටියේ, ඇගේ ප්‍රතිකාර ලබා ගැනීමට ය. ඇය කාගෙන්වත් මුදල් බලාපොරොත්තු වූයේ නැත. නමුත් ඇයට පලතුරු, එළවළු හෝ කුකුළු බිත්තර වැනි දේ ලැබුණි. ඇතැම් රෝගීන්ට රාත්‍රී කාලයේදී පවා ඇය ප්‍රතිකාර කළා ය. ඇගේ විශේෂත්වය වූයේ තෙල් වර්ග සාදා රෝගීන්ගේ සන්ධි වේදනාවන් සුව කිරීම ය. ඇගේ දරුවන්ට හෝ මුනුබුරු මිනිබිරියන්ට ඇය රැකියාව වෙනුවෙන් කිසිදු බාධාවක් නොවූවා ය. ඇය ගමේ මිනිසුන්ගේ හදවත් දිනාගත් සැබෑ වීරවරිය වූවා ය.`,

    `🦚 මොනරාගේ ආඩම්බරය
දිනක් කැලෑවේ සිටි ලස්සනම මොනරා තමාගේ පියාපත් දිගහැරගෙන ඇවිද්දේ අනිත් සතුන්ට තමාගේ ලස්සන පෙන්වීමට ය. මොනරා කල්පනා කළේ, "මේ කැලේ මට වඩා ලස්සන සතෙක් නැහැ. මම හැමෝටම වඩා වැදගත්." ඌ උඩඟු කමින් ඇවිද ගිය නිසා, කුඩා වළක් තිබෙනවා දුටුවේ නැත. ඌ වළේ වැටී, තමාගේ ලස්සන පියාපත් තුවාල කර ගත්තේ ය.

අනෙක් සතුන් මොනරාට උපකාර කිරීමට පැමිණිය ද, මොනරාගේ ආඩම්බරය නිසා ඌ කිසිවෙකුගේ උදව් ගත්තේ නැත. නමුත් ඌට වළෙන් එළියට ඒමට නොහැකි විය. අවසානයේදී පුංචි ඉත්තෑවෙක් පැමිණ, ඌට අත්තක් දුන්නේ ය. මොනරාට සිතුණේ තමාගේ ආඩම්බරය නිසා අනතුරකට පත් වූ බව ය. ඌ ඉත්තෑවාට ස්තූති කර, තමාගේ වැරදි පිළිගත්තේ ය. එතැන් සිට මොනරා අනිත් සතුන් සමඟ මිත්‍රශීලීව ජීවත් විය.`,

    `🌧️ වැස්සේ අඳින සිත්තරා
කලාවට ඉතා ප්‍රිය කළ චිත්‍ර ශිල්පියෙක් ගමක ජීවත් විය. ඔහු නිවසින් පිටතට ගියේ වැස්සට පමණි. ගමේ මිනිස්සු ඔහුට "වැස්සේ අඳින සිත්තරා" කියා විහිළු කළහ. ඒත් ඔහු කිසිවෙකුට ඇහුම්කන් දුන්නේ නැත. වැහි කාලයේදී ඔහු විශාල කුඩයක් ඔලුව මත තබාගෙන, වතුර බිංදු වැටෙන ආකාරය, මඩ ගොඩවල් සහ ගස්වල වෙනස්කම් චිත්‍රයට නැගුවේ ය.

අනිත් සියලු සිත්තරුන් මල් සහ ගස් පමණක් අඳිද්දී, ඔහුගේ චිත්‍ර සැබෑ ජීවිතය නිරූපණය කළේ ය. දිනක් ගමේ පැවති චිත්‍ර ප්‍රදර්ශනයකදී, ඔහුගේ "වැස්ස සහ ගම" චිත්‍රයට පළමු ස්ථානය ලැබුණි. විනිසුරුවරු කීවේ, "ඔහුගේ නිර්මාණය තුළ අප ජීවත් වන ලෝකයේ සත්‍යය තිබෙනවා." එතැන් පටන් ගමේ මිනිස්සු වැස්සේ අඳින සිත්තරාට ගරු කළේ ය. ඔහු ජීවිතය වෙනස් කරන ආකාරය කියා දුන්නේ ය.`,

    `🚲 පැරණි සයිකල් සාප්පුව
නගරයේ කෙළවරක තිබූ පැරණි සයිකල් සාප්පුවක හිමිකරු වූයේ ලොකු මාමා ය. ඔහු සයිකල් අලුත්වැඩියා කරනවාට වඩා, කැඩුණු සයිකල් නැවත භාවිතයට ගන්නට පුරුදු වී සිටියේ ය. ලොකු මාමා විශ්වාස කළේ, "කිසිම දෙයක් අපතේ යන්න හොඳ නැහැ." කඩේට පැමිණි බොහෝ දෙනෙක් අලුත් සයිකල් ඉල්ලද්දී, ලොකු මාමා ඔවුන්ට පැරණි නමුත් හොඳින් අලුත්වැඩියා කළ සයිකල් ලබා දුන්නේ ය.

ඔහුගේ ගාස්තු ඉතා අඩු විය. ඔහු කිසිදු ලාභයක් බලාපොරොත්තු නොවී, දරුවන්ට සයිකල් පැදීමට ඇති අවස්ථාව ලබා දුන්නේ ය. දිනක් මෝටර් රථයක ගැටී කැඩුණු සයිකලයක් ගෙනා දරුවෙකුට, ලොකු මාමා පැරණි අමතර කොටස් යොදාගෙන එය අලුතින් සාදා දුන්නේ ය. දරුවා සතුටින් සිනාසුණා. ලොකු මාමාගේ මේ අපූරු සේවය නිසා නගරයේ පරිසරය ද සුරැකිණි.`,

    `🐕 බල්ලා සහ කුරුල්ලා
විශාල වත්තේ බල්ලෙක් සහ කුඩා කුරුල්ලෙක් ජීවත් විය. බල්ලා හිතුවා, "මම ලොකුයි, මට ශක්තිය වැඩියි." කුරුල්ලා හිතුවා, "මම පුංචියි, ඒත් මට අහසේ පියාඹන්න පුළුවන්." ඔවුන් දෙදෙනාට එකට කතා බස් කරන්නට පුළුවන් විය. දිනක් බල්ලා වත්තේ තිබූ විශාල වලකට වැටුණා. ඌට එළියට එන්නට බැරි විය.

බල්ලා කෑ ගැසුවත් කිසිවෙකුට ඇසුණේ නැත. කුරුල්ලා වහාම ඉහළ අහසට පියාසර කළේ ය. ඈතින් සිටි මිනිසෙක් කුරුල්ලාගේ අමුතු පියාසැරි රටාව දැක පුදුම විය. ඔහු වත්තට පැමිණ බල්ලා වලක වැටී සිටිනවා දුටුවේ ය. මිනිසා බල්ලා එළියට ගත්තේ ය. බල්ලා කුරුල්ලාට ස්තූති කළේ ය. එදා සිට ඔවුන් දෙදෙනා තේරුම් ගත්තේ, ලොකු කුඩා භේදයකින් තොරව මිත්‍රත්වය වැදගත් බව ය.`,

    `📝 දිනපොතේ කතාව
ගමේ පුංචි දැරියක් දිනපොතක් තබා ගැනීමට පුරුදුව සිටියා ය. ඇය දිනපතාම පාසලේ සහ ගමේ සිදු වූ දේවල් එහි ලියා තැබුවා ය. ඇයගේ දිනපොතේ තිබුණේ දිනපතා කරන කාරුණික ක්‍රියා පිළිබඳ සටහන් ය. "අද මම අත්තම්මාට තේ එකක් හැදුවා. මම මල්ලිත් එක්ක සෙල්ලම් කළා." වැනි දේවල් එහි තිබුණි. ඇයගේ මේ පුරුද්ද ගුරුවරිය දුටුවා ය.

ගුරුවරිය දිනපොත පන්තියේදී කියෙව්වා. පන්තියේ සිටි අනෙක් දරුවන්ට ද කාරුණික ක්‍රියා කිරීමේ වටිනාකම තේරුම් ගියා. ඔවුන් ද දිනපොත් තබා ගැනීමට පටන් ගත්තා. ගුරුවරිය සතුටින් කිව්වා, "පුංචි දැරියගේ දිනපොත මුළු පන්තියටම ආදර්ශයක් වුණා." දැරිය එදා සිට කිසිවෙකුට නොදැනෙන්නට තවත් කාරුණික දේවල් කිරීමට පටන් ගත්තා ය.`
  ];

  const age10Stories = age9Stories; // Same stories for age 10

  // Randomly select a story when age changes to 6, 7, 8, 9, or 10
  useEffect(() => {
    if (childAge === 6) {
      const randomIndex = Math.floor(Math.random() * age6Stories.length);
      setSelectedAge6Story(age6Stories[randomIndex]);
    } else if (childAge === 7) {
      const randomIndex = Math.floor(Math.random() * age7Stories.length);
      setSelectedAge7Story(age7Stories[randomIndex]);
    } else if (childAge === 8) {
      const randomIndex = Math.floor(Math.random() * age8Stories.length);
      setSelectedAge8Story(age8Stories[randomIndex]);
    } else if (childAge === 9) {
      const randomIndex = Math.floor(Math.random() * age9Stories.length);
      setSelectedAge9Story(age9Stories[randomIndex]);
    } else if (childAge === 10) {
      const randomIndex = Math.floor(Math.random() * age10Stories.length);
      setSelectedAge10Story(age10Stories[randomIndex]);
    }
  }, [childAge]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      // Best supported mimeTypes for recording
      const mimeTypes = [
        'audio/mp4',
        'audio/mpeg',
        'audio/webm;codecs=opus',
        'audio/webm'
      ];

      let selectedMimeType = '';
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType;
          break;
        }
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: selectedMimeType
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const mime = mediaRecorder.mimeType || 'audio/webm';
        const fileExtension = mime.includes('mp4') ? 'm4a' : mime.includes('mpeg') ? 'mp3' : 'webm';

        const blob = new Blob(chunksRef.current, { type: mime });
        const file = new File([blob], `recording_${Date.now()}.${fileExtension}`, { type: mime });
        setSelectedFile(file);
        // Don't reset recordingTime here - preserve it to show the duration
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      // Clear the timer first to preserve the final recording time
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  }, [isRecording]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const clearFile = () => {
    setSelectedFile(null);
    setRecordingTime(0);
    if (isRecording) {
      stopRecording();
    }
  };

  const handleSubmit = async () => {
    const fileToUpload = selectedFile;
    if (!fileToUpload) {
      alert('Please record audio first');
      return;
    }

    // Set analyzing flag first (before navigation)
    sessionStorage.setItem('isAnalyzing', 'true');
    sessionStorage.setItem('pendingChildAge', childAge.toString());
    // Clear any previous results
    sessionStorage.removeItem('analysisResult');
    sessionStorage.removeItem('analysisError');

    // Navigate to results page immediately to show loading
    // Using setTimeout to ensure sessionStorage is written before navigation
    setTimeout(() => {
      // Use replace: false to allow going back
      navigate('/speech/results', { replace: false });
      // Start analysis after navigation
      performAnalysis(fileToUpload);
    }, 0);
  };

  const performAnalysis = async (fileToUpload) => {
    try {
      const formData = new FormData();
      formData.append('file', fileToUpload);
      formData.append('child_age', childAge.toString());

      const response = await fetch('http://localhost:8003/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { detail: errorText };
        }
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Store result and clear loading flag
      sessionStorage.setItem('analysisResult', JSON.stringify(result));
      sessionStorage.removeItem('isAnalyzing');

      // On success, navigate to results page with full result data
      navigate('/speech/results', { state: { result }, replace: true });

    } catch (error) {
      console.error('Analysis error:', error);
      sessionStorage.removeItem('isAnalyzing');
      sessionStorage.setItem('analysisError', error.message || 'Failed to analyze audio. Please try again.');
      alert(error.message || 'Failed to analyze audio. Please try again.');
      // After alert, just stop analyzing but stay on page
      // navigate('/speech/reading', { replace: true }); 
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isRecording) {
        stopRecording();
      }
    };
  }, [isRecording, stopRecording]);

  const generateParagraph = (age) => {
    if (age === 6) {
      return selectedAge6Story || age6Stories[0];
    }

    if (age === 7) {
      return selectedAge7Story || age7Stories[0];
    }

    if (age === 8) {
      return selectedAge8Story || age8Stories[0];
    }

    if (age === 9) {
      return selectedAge9Story || age9Stories[0];
    }

    if (age === 10) {
      return selectedAge10Story || age10Stories[0];
    }

    const paragraphs = {

      11: `තාක්ෂණය අපේ ජීවිතවල හරිම වැදගත්. මම පරිගණක භාවිතා කරලා හොයාගන්නවා හා ඉගෙන ගන්නවා. අනාගතයේ මට සොෆ්ට්වෙයාර් ඉංජිනේරුවෙක් වෙන්න ඕනෑ. පරිගණක ගැන මට ඉතා කැමතියි. ඔවුන් පුදුම දේවල් කරන්න පුළුවන්. තාක්ෂණය ලෝකය වෙනස් කරනවා.

පාසලේ අපට පරිගණක විද්‍යා පන්තියක් තියෙනවා. අපි කේතකරණය ඉගෙන ගන්නවා. අපි වැඩසටහන් ලිවීම ඉගෙන ගන්නවා. මගේ ගුරුවරයා පරිගණක කේත රචනය කරන්න මට උගන්වනවා. අපි සරල ක්‍රීඩා සාදනවා. අපි චිත්‍ර නිර්මාණය කරන්න වැඩසටහන් සාදනවා. කේතනය ප්‍රහේලිකා විසඳීම වැනි ය.

මම නිවසේදී වැඩසටහන් අභ්‍යාස කරනවා. මම අන්තර්ජාලයේ නිබන්ධන බලනවා. මම නව කේත භාෂා ඉගෙන ගන්නවා. මම Python සහ JavaScript ඉගෙන ගන්නවා. මම කුඩා ව්‍යාපෘති සාදනවා. මම කැල්කියුලේටරයක් සෑදුවා. මම කාලගුණ යෙදුමක් සෑදුවා. සෑම ව්‍යාපෘතියක්ම මට නව දේවල් ඉගෙන ගන්නවා.

තාක්ෂණය අධ්‍යාපනය වෙනස් කරනවා. අපට ඕනෑම දෙයක් ඕනෑම වේලාවක ඉගෙන ගන්න පුළුවන්. අපට අන්තර්ක්‍රියාකාරී ක්‍රීඩා තියෙනවා. අපට අධ්‍යාපනික වීඩියෝ තියෙනවා. අපට අන්තර්ක්‍රියාකාරී ක්‍රීඩා තියෙනවා. තාක්ෂණය ඉගෙනීම විනෝදජනක කරනවා. එය ඉගෙනීම පහසු කරනවා.

තාක්ෂණය සන්නිවේදනය වෙනස් කරනවා. අපට ලොව පුරා මිතුරන් සමඟ කතා කරන්න පුළුවන්. අපට වීඩියෝ ඇමතුම් කරන්න පුළුවන්. අපට ක්ෂණික පණිවිඩ යැවීමට පුළුවන්. තාක්ෂණය ජනතාව සම්බන්ධ කරනවා. එය ලෝකය කුඩා කරනවා.

අනාගතය තාක්ෂණයට අයත්. කෘතිම බුද්ධිය විවර වෙනවා. රොබෝවරු පොදු වෙමින් පවතී. අපට ස්වයං ධාවනය වන මෝටර් රථ ලැබෙයි. අපට ස්මාර්ට් නිවාස ලැබෙයි. මට මේ අනාගතයේ කොටසක් වෙන්න අවශ්‍යයි. මට හොඳ දේවල් සෑදීමට අවශ්‍යයි. මට තාක්ෂණය භාවිතා කර ගැටළු විසඳීමට අවශ්‍යයි. මට ලෝකය වඩා හොඳ තැනක් කිරීමට අවශ්‍යයි.`,

      12: `පරිසරය රැකගන්න අපි හැමෝම වගකිව යුතුයි. ප්ලාස්ටික් භාවිතය අඩු කරන්න, ගස් සිටුවන්න හා ජලය ඉතිරි කරන්න අපි තීරණය කරන්න ඕනෑ. අපේ ග්‍රහලෝකය අපේ නිවස. අපට එය අනාගත පරම්පරා සඳහා ආරක්ෂා කළ යුතුයි. දේශගුණික විපර්යාස සැබෑ ගැටළුවකි.

දේශගුණය වෙනස් වෙමින් පවතී. උෂ්ණත්වය ඉහළ යනවා. අයිස් තට්ටු දියවෙමින් පවතී. මුහුදු මට්ටම ඉහළ යනවා. අන්ත කාලගුණික සිදුවීම් සිදු වෙනවා. අපි වැඩි සිදුවීම් බලනවා. අපි වැඩි නියඟ බලනවා. මෙය අපේ ග්‍රහලෝකය සඳහා අනතුරුදායකයි.

අපේ ක්‍රියාවන් සැලකිය යුතු වෙනසක් කරන්න පුළුවන්. අපි විදුලිය ඉතිරි කරන්න පුළුවන්. අපි නැවත භාවිතා කළ හැකි බලශක්තිය භාවිතා කරන්න පුළුවන්. අපි ප්ලාස්ටික් අඩුවෙන් භාවිතා කරන්න පුළුවන්. අපි තව නැවත භාවිතා කරන්න සහ ප්‍රතිචක්‍රීකරණය කරන්න පුළුවන්. අපි තව ගස් පැළවීම කරන්න පුළුවන්. සෑම කුඩා ක්‍රියාවක්ම උදව් කරනවා.

අපේ පාසලේ අපි පරිසර ව්‍යාපෘතියක් ආරම්භ කළා. අපි පාසල් මිදුලේ ගස් සිටුවන්නවා. අපි සංයුක්තීකරණ පටල් ඇති කළා. අපි ප්ලාස්ටික් අඩු කිරීමට උත්සාහ කරන්නවා. අපි ප්ලාස්ටික් බෝතල් භාවිතා නොකරන්නවා. අපි නැවත භාවිතා කළ හැකි බෑග් ගෙන යන්නවා. අපේ ව්‍යාපෘතිය වෙනසක් සිදු කරමින් තියෙනවා.

ජලය ඉතිරි කිරීම ද වැදගත්. ජලය වටිනා සම්පතක්. බොහෝ ජනයාට පිරිසිදු ජලයට ප්‍රවේශය නැහැ. අපි ජලය නාස්ති නොකළ යුතුයි. අපි කෙටි නැවුම් ගන්න පුළුවන්. අපි කරාම සවි කරන්න පුළුවන්. අපි වැසි ජලය එකතු කරන්න පුළුවන්. ජලය ඉතිරි කිරීම පරිසරයට උදව් කරනවා.

වන ජීවීන් ආරක්ෂා කිරීම වැදගත්. බොහෝ සතුන් වඳවීමේ තර්ජනයට මුහුණ දෙනවා. ඔවුන්ගේ වාසස්ථාන විනාශ වෙමින් පවතී. අපි වන ජීවීන් ආරක්ෂා කළ යුතුයි. අපි වාසස්ථාන ආරක්ෂා කළ යුතුයි. අපි ජාතික උද්‍යාන සහ සංරක්ෂණ පිහිටුවීමට පුළුවන්. සෑම විශේෂයක්ම වැදගත්.

පරිසරය ආරක්ෂා කිරීම සැමගේම වගකීමයි. අපේ ක්‍රියාවන් අනාගතය තීරණය කරනවා. අපි අද ප්‍රතිකාර කළ යුතුයි. අපි කුඩා දේවල්වලින් ආරම්භ කරන්න පුළුවන්. අපට අපේ පවුල් හා යාළුවන් අධ්‍යාපනය ලබා දිය හැක. එකට, අපට වෙනසක් කරන්න පුළුවන්. අපි සෞඛ්‍ය සම්පන්න ග්‍රහලෝකයක් තනන්න පුළුවන්. එය අපේ සහ අනාගත පරම්පරා සඳහා වේ.`
    };
    return paragraphs[age] || paragraphs[8];
  };

  return (
    <section id="reading" className="py-20">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-400/30 rounded-full mb-4">
              <span className="text-3xl">📖</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Reading Task
            </h2>
            <p className="text-lg text-white/80">
              Read the fun story below and record your voice! 🎤
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-gradient-to-r from-blue-500/25 to-purple-500/25 border-l-4 border-blue-400 p-5 mb-6 backdrop-blur-sm rounded-xl shadow-md">
            <div className="flex items-start">
              <div className="text-2xl mr-3">💡</div>
              <div>
                <p className="text-base text-white font-medium">
                  <strong className="text-blue-300">Instructions:</strong> Read the story below out loud clearly and slowly.
                  When you're ready, click the microphone button to record your voice. Have fun! ✨
                </p>
              </div>
            </div>
          </div>

          {/* Main Content: Paragraph and Recording Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Paragraph Display - Left Side */}
            <div className="bg-gradient-to-br from-blue-500/15 to-purple-500/15 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-blue-400/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-400/10 rounded-full blur-2xl"></div>
              <div className="relative z-10">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-2xl">📚</span>
                  <span>Story for Age {childAge}</span>
                </h3>
                <div className="text-lg leading-relaxed text-white/95 whitespace-pre-line max-h-[600px] overflow-y-auto custom-scrollbar bg-white/5 rounded-lg p-4 border border-white/10">
                  {generateParagraph(childAge)}
                </div>
              </div>
            </div>

            {/* Audio Recording Section - Right Side */}
            <div className="bg-gradient-to-br from-green-500/15 to-blue-500/15 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-green-400/30 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-16 h-16 bg-green-400/10 rounded-full blur-xl"></div>
              {/* Recording Area */}
              <div className="bg-white/10 rounded-2xl p-6 text-center border border-white/20 relative z-10">
                <div className="space-y-4">
                  {selectedFile && !isRecording ? (
                    <>
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-green-400/30 rounded-full mb-4">
                        <span className="text-4xl">✅</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">Great Job! 🎉</h3>
                        <div className="bg-blue-400/20 rounded-lg p-3 mb-3 border border-blue-400/30">
                          <p className="text-blue-200 font-semibold">Duration: {formatTime(recordingTime)}</p>
                        </div>
                        <button
                          onClick={clearFile}
                          className="bg-purple-500/30 hover:bg-purple-500/40 text-white px-6 py-2 rounded-full font-semibold transition-all duration-300 border border-purple-400/50"
                        >
                          Record Again
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 transition-all duration-300 ${isRecording
                        ? 'bg-red-500/40 animate-pulse shadow-lg shadow-red-500/30'
                        : 'bg-blue-400/30 hover:scale-110'
                        }`}>
                        <span className="text-4xl">{isRecording ? '🎤' : '🎙️'}</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-3">
                          {isRecording ? 'Recording... 🔴' : 'Ready to Record! ✨'}
                        </h3>
                        {isRecording && (
                          <div className="mb-4 bg-red-500/20 rounded-xl p-4 border border-red-400/30">
                            <div className="text-3xl font-mono font-bold text-yellow-300 mb-2">
                              {formatTime(recordingTime)}
                            </div>
                            <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                              <div className="bg-gradient-to-r from-red-400 to-pink-400 h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
                            </div>
                          </div>
                        )}
                        <p className="text-white/80 mb-4 text-base">
                          {isRecording
                            ? 'Keep reading the story clearly! 📖'
                            : 'Click the button below to start! 👇'
                          }
                        </p>
                        <button
                          onClick={() => {
                            if (isRecording) {
                              stopRecording();
                            } else {
                              startRecording();
                            }
                          }}
                          className={`w-full px-6 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${isRecording
                            ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse border-2 border-red-400'
                            : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-2 border-white/30 shadow-lg'
                            }`}
                        >
                          {isRecording ? '⏹️ Stop Recording' : '🎤 Start Recording'}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-6 relative z-10">
                <button
                  onClick={handleSubmit}
                  disabled={!selectedFile}
                  className={`w-full px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${selectedFile
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white shadow-xl hover:shadow-2xl border-2 border-yellow-300/50'
                    : 'bg-white/10 text-white/50 cursor-not-allowed border-2 border-white/20'
                    }`}
                >
                  {selectedFile ? (
                    <span className="flex items-center justify-center gap-2">
                      <span>🚀</span>
                      <span>Analyze My Speech!</span>
                      <span>✨</span>
                    </span>
                  ) : (
                    '🎤 Record Audio First'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReadingTask;