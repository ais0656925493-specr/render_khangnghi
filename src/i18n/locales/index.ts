import af from './af';
import ak from './ak';
import am from './am';
import ar from './ar';
import as from './as';
import ay from './ay';
import az from './az';
import be from './be';
import bg from './bg';
import bm from './bm';
import bn from './bn';
import bs from './bs';
import ca from './ca';
import ceb from './ceb';
import ckb from './ckb';
import co from './co';
import cs from './cs';
import cy from './cy';
import da from './da';
import de from './de';
import dv from './dv';
import ee from './ee';
import el from './el';
import es from './es';
import et from './et';
import eu from './eu';
import fa from './fa';
import fi from './fi';
import fil from './fil';
import fr from './fr';
import fy from './fy';
import ga from './ga';
import gd from './gd';
import gl from './gl';
import gn from './gn';
import gu from './gu';
import ha from './ha';
import he from './he';
import hi from './hi';
import hr from './hr';
import ht from './ht';
import hu from './hu';
import hy from './hy';
import id from './id';
import ig from './ig';
import is from './is';
import it from './it';
import ja from './ja';
import jv from './jv';
import ka from './ka';
import kk from './kk';
import km from './km';
import kn from './kn';
import ko from './ko';
import ku from './ku';
import ky from './ky';
import lb from './lb';
import ln from './ln';
import lo from './lo';
import lt from './lt';
import lv from './lv';
import mg from './mg';
import mi from './mi';
import mk from './mk';
import ml from './ml';
import mn from './mn';
import mr from './mr';
import ms from './ms';
import mt from './mt';
import my from './my';
import ne from './ne';
import nl from './nl';
import no from './no';
import nso from './nso';
import ny from './ny';
import om from './om';
import or from './or';
import pa from './pa';
import pl from './pl';
import ps from './ps';
import pt from './pt';
import qu from './qu';
import ro from './ro';
import ru from './ru';
import rw from './rw';
import sd from './sd';
import si from './si';
import sk from './sk';
import sl from './sl';
import sm from './sm';
import sn from './sn';
import so from './so';
import sq from './sq';
import sr from './sr';
import st from './st';
import su from './su';
import sv from './sv';
import sw from './sw';
import ta from './ta';
import te from './te';
import tg from './tg';
import th from './th';
import ti from './ti';
import tk from './tk';
import tr from './tr';
import ts from './ts';
import tt from './tt';
import ug from './ug';
import uk from './uk';
import ur from './ur';
import uz from './uz';
import vi from './vi';
import xh from './xh';
import yi from './yi';
import yo from './yo';
import zh from './zh';
import zhTw from './zh-tw';
import zu from './zu';
import type { TranslationDictionary } from './types';

const LANGUAGE_ALIASES: Record<string, string> = {
    iw: 'he',
    in: 'id',
    jw: 'jv',
    'zh-cn': 'zh',
    'zh-hk': 'zh-tw',
    'zh-tw': 'zh-tw',
    yue: 'zh',
    tl: 'fil',
    fil: 'fil'
};

const LOCALES: Record<string, TranslationDictionary> = {
    af,
    ak,
    am,
    ar,
    as,
    ay,
    az,
    be,
    bg,
    bm,
    bn,
    bs,
    ca,
    ceb,
    ckb,
    co,
    cs,
    cy,
    da,
    de,
    dv,
    ee,
    el,
    es,
    et,
    eu,
    fa,
    fi,
    fil,
    fr,
    fy,
    ga,
    gd,
    gl,
    gn,
    gu,
    ha,
    he,
    hi,
    hr,
    ht,
    hu,
    hy,
    id,
    ig,
    is,
    it,
    ja,
    jv,
    ka,
    kk,
    km,
    kn,
    ko,
    ku,
    ky,
    lb,
    ln,
    lo,
    lt,
    lv,
    mg,
    mi,
    mk,
    ml,
    mn,
    mr,
    ms,
    mt,
    my,
    ne,
    nl,
    no,
    nso,
    ny,
    om,
    or,
    pa,
    pl,
    ps,
    pt,
    qu,
    ro,
    ru,
    rw,
    sd,
    si,
    sk,
    sl,
    sm,
    sn,
    so,
    sq,
    sr,
    st,
    su,
    sv,
    sw,
    ta,
    te,
    tg,
    th,
    ti,
    tk,
    tr,
    ts,
    tt,
    ug,
    uk,
    ur,
    uz,
    vi,
    xh,
    yi,
    yo,
    zh,
    'zh-tw': zhTw,
    zu
};

const normalizeLanguage = (targetLang: string) => {
    const normalizedTarget = String(targetLang || '').trim().toLowerCase();
    if (!normalizedTarget) {
        return '';
    }
    if (LANGUAGE_ALIASES[normalizedTarget]) {
        return LANGUAGE_ALIASES[normalizedTarget];
    }
    if (LOCALES[normalizedTarget]) {
        return normalizedTarget;
    }
    const [baseLang = ''] = normalizedTarget.split('-');
    const normalizedBase = baseLang.toLowerCase();
    return LANGUAGE_ALIASES[normalizedBase] || normalizedBase;
};

export const getLocaleDictionary = (targetLang: string): TranslationDictionary | null => {
    const normalized = normalizeLanguage(targetLang);
    if (!normalized || normalized === 'en') {
        return null;
    }
    return LOCALES[normalized] || null;
};

export type { TranslationDictionary };
