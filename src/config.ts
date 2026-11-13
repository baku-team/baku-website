// REVERSE の製品サイト。正式な URL が決まったら、この 1 行だけ変える。
export const REVERSE_URL = 'https://reverse-lp.pages.dev/';
// うみねこ診療所のサイト。下書きの間は、貘の共有用ファイル（貘/ 直下）から見た診療所の共有用ファイルの場所。
// 公開するときは、診療所の正式な URL に変える。
export const CLINIC_URL = '貘-事業内容/離島診療/HP検討/うみねこ診療所_サイト案_20261111.html';

// 島の動物診療を出すか（2026-11-13 坂本さん「いったんシステムとIPだけ・島は見えなくしといて・消さなくていい」）。
// 戻すときは true にして、pages/business/_03-island.astro の名前を 03.astro に戻す。
export const SHOW_ISLAND = false;

// お問い合わせ（2026-11-13 坂本さん）：REVERSE の受付ページができるまではメールで受ける。できたら FORM_READY を true に。
export const FORM_READY = false;
export const CONTACT_MAIL = 'baku@baku-llc.co.jp';
// プライバシーポリシー（2026-11-13 坂本さん「今回は出さない」）。保管先と保管期間が決まったら true にして、pages/_privacy.astro を privacy.astro に戻す。
export const SHOW_PRIVACY = false;
