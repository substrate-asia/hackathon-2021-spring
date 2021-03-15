'use strict';

const rgnParent = new Map([
  /* level-1 */
  ['AMER', 'ROOT'],
  ['ASIA', 'ROOT'],
  ['AFRI', 'ROOT'],
  ['EURO', 'ROOT'],
  ['OCEA', 'ROOT'],

  /* level-2 */
  ['AMN', 'AMER'],
  ['AMC', 'AMER'],
  ['AMM', 'AMER'],
  ['AMS', 'AMER'],

  ['ASC', 'ASIA'],
  ['ASE', 'ASIA'],
  ['ASW', 'ASIA'],
  ['ASS', 'ASIA'],
  ['ASD', 'ASIA'],

  ['AFN', 'AFRI'],
  ['AFM', 'AFRI'],
  ['AFE', 'AFRI'],
  ['AFW', 'AFRI'],
  ['AFS', 'AFRI'],

  ['EUN', 'EURO'],
  ['EUE', 'EURO'],
  ['EUW', 'EURO'],
  ['EUS', 'EURO'],

  ['OCP', 'OCEA'],
  ['OCA', 'OCEA'],
  ['OCM', 'OCEA'],
  ['OCN', 'OCEA'],

  /* level-3 */
  ['BM', 'AMN'],
  ['CA', 'AMN'],
  ['GL', 'AMN'],
  ['PM', 'AMN'],
  ['US', 'AMN'],

  ['AG', 'AMC'],
  ['AI', 'AMC'],
  ['AW', 'AMC'],
  ['BB', 'AMC'],
  ['BL', 'AMC'],
  ['BQ', 'AMC'],
  ['BS', 'AMC'],
  ['CU', 'AMC'],
  ['CW', 'AMC'],
  ['DM', 'AMC'],
  ['DO', 'AMC'],
  ['GD', 'AMC'],
  ['GP', 'AMC'],
  ['HT', 'AMC'],
  ['JM', 'AMC'],
  ['KN', 'AMC'],
  ['KY', 'AMC'],
  ['LC', 'AMC'],
  ['MF', 'AMC'],
  ['MQ', 'AMC'],
  ['MS', 'AMC'],
  ['PR', 'AMC'],
  ['SX', 'AMC'],
  ['TC', 'AMC'],
  ['TT', 'AMC'],
  ['VC', 'AMC'],
  ['VG', 'AMC'],
  ['VI', 'AMC'],

  ['BZ', 'AMM'],
  ['CR', 'AMM'],
  ['GT', 'AMM'],
  ['HN', 'AMM'],
  ['MX', 'AMM'],
  ['NI', 'AMM'],
  ['PA', 'AMM'],
  ['SV', 'AMM'],

  ['AR', 'AMS'],
  ['BO', 'AMS'],
  ['BR', 'AMS'],
  ['CL', 'AMS'],
  ['CO', 'AMS'],
  ['EC', 'AMS'],
  ['FK', 'AMS'],
  ['GF', 'AMS'],
  ['GS', 'AMS'],
  ['GY', 'AMS'],
  ['PE', 'AMS'],
  ['PY', 'AMS'],
  ['SR', 'AMS'],
  ['UY', 'AMS'],
  ['VE', 'AMS'],

  ['KG', 'ASC'],
  ['KZ', 'ASC'],
  ['TJ', 'ASC'],
  ['TM', 'ASC'],
  ['UZ', 'ASC'],

  ['CN', 'ASE'],
  ['HK', 'ASE'],
  ['JP', 'ASE'],
  ['KP', 'ASE'],
  ['KR', 'ASE'],
  ['MN', 'ASE'],
  ['MO', 'ASE'],
  ['TW', 'ASE'],

  ['AE', 'ASW'],
  ['AM', 'ASW'],
  ['AZ', 'ASW'],
  ['BH', 'ASW'],
  ['CY', 'ASW'],
  ['GE', 'ASW'],
  ['IL', 'ASW'],
  ['IQ', 'ASW'],
  ['JO', 'ASW'],
  ['KW', 'ASW'],
  ['LB', 'ASW'],
  ['OM', 'ASW'],
  ['PS', 'ASW'],
  ['QA', 'ASW'],
  ['SA', 'ASW'],
  ['SY', 'ASW'],
  ['TR', 'ASW'],
  ['YE', 'ASW'],

  ['AF', 'ASS'],
  ['BD', 'ASS'],
  ['BT', 'ASS'],
  ['IN', 'ASS'],
  ['IR', 'ASS'],
  ['LK', 'ASS'],
  ['MV', 'ASS'],
  ['NP', 'ASS'],
  ['PK', 'ASS'],

  ['BN', 'ASD'],
  ['ID', 'ASD'],
  ['KH', 'ASD'],
  ['LA', 'ASD'],
  ['MM', 'ASD'],
  ['MY', 'ASD'],
  ['PH', 'ASD'],
  ['SG', 'ASD'],
  ['TH', 'ASD'],
  ['TL', 'ASD'],
  ['VN', 'ASD'],

  ['DZ', 'AFN'],
  ['EG', 'AFN'],
  ['LY', 'AFN'],
  ['MA', 'AFN'],
  ['SD', 'AFN'],
  ['TN', 'AFN'],

  ['AO', 'AFM'],
  ['CD', 'AFM'],
  ['CF', 'AFM'],
  ['CG', 'AFM'],
  ['CM', 'AFM'],
  ['GA', 'AFM'],
  ['GQ', 'AFM'],
  ['ST', 'AFM'],
  ['TD', 'AFM'],

  ['BI', 'AFE'],
  ['DJ', 'AFE'],
  ['ER', 'AFE'],
  ['ET', 'AFE'],
  ['IO', 'AFE'],
  ['KE', 'AFE'],
  ['KM', 'AFE'],
  ['MG', 'AFE'],
  ['MU', 'AFE'],
  ['MW', 'AFE'],
  ['MZ', 'AFE'],
  ['RE', 'AFE'],
  ['RW', 'AFE'],
  ['SC', 'AFE'],
  ['SO', 'AFE'],
  ['SS', 'AFE'],
  ['TF', 'AFE'],
  ['TZ', 'AFE'],
  ['UG', 'AFE'],
  ['YT', 'AFE'],
  ['ZM', 'AFE'],
  ['ZW', 'AFE'],

  ['BF', 'AFW'],
  ['BJ', 'AFW'],
  ['CI', 'AFW'],
  ['CV', 'AFW'],
  ['GH', 'AFW'],
  ['GM', 'AFW'],
  ['GN', 'AFW'],
  ['GW', 'AFW'],
  ['LR', 'AFW'],
  ['ML', 'AFW'],
  ['MR', 'AFW'],
  ['NE', 'AFW'],
  ['NG', 'AFW'],
  ['SH', 'AFW'],
  ['SL', 'AFW'],
  ['SN', 'AFW'],
  ['TG', 'AFW'],

  ['BW', 'AFS'],
  ['LS', 'AFS'],
  ['NA', 'AFS'],
  ['SZ', 'AFS'],
  ['ZA', 'AFS'],

  ['AX', 'EUN'],
  ['DK', 'EUN'],
  ['EE', 'EUN'],
  ['FI', 'EUN'],
  ['FO', 'EUN'],
  ['GB', 'EUN'],
  ['GG', 'EUN'],
  ['IE', 'EUN'],
  ['IM', 'EUN'],
  ['IS', 'EUN'],
  ['JE', 'EUN'],
  ['LT', 'EUN'],
  ['LV', 'EUN'],
  ['NO', 'EUN'],
  ['SE', 'EUN'],
  ['SJ', 'EUN'],

  ['BG', 'EUE'],
  ['BY', 'EUE'],
  ['CZ', 'EUE'],
  ['HU', 'EUE'],
  ['MD', 'EUE'],
  ['PL', 'EUE'],
  ['RO', 'EUE'],
  ['RU', 'EUE'],
  ['SK', 'EUE'],
  ['UA', 'EUE'],

  ['AT', 'EUW'],
  ['BE', 'EUW'],
  ['CH', 'EUW'],
  ['DE', 'EUW'],
  ['FR', 'EUW'],
  ['LI', 'EUW'],
  ['LU', 'EUW'],
  ['MC', 'EUW'],
  ['NL', 'EUW'],

  ['AD', 'EUS'],
  ['AL', 'EUS'],
  ['BA', 'EUS'],
  ['ES', 'EUS'],
  ['GI', 'EUS'],
  ['GR', 'EUS'],
  ['HR', 'EUS'],
  ['IT', 'EUS'],
  ['ME', 'EUS'],
  ['MK', 'EUS'],
  ['MT', 'EUS'],
  ['PT', 'EUS'],
  ['RS', 'EUS'],
  ['SI', 'EUS'],
  ['SM', 'EUS'],
  ['VA', 'EUS'],
  ['XK', 'EUS'],

  ['AS', 'OCP'],
  ['CK', 'OCP'],
  ['NU', 'OCP'],
  ['PF', 'OCP'],
  ['PN', 'OCP'],
  ['TK', 'OCP'],
  ['TO', 'OCP'],
  ['TV', 'OCP'],
  ['WF', 'OCP'],
  ['WS', 'OCP'],

  ['AU', 'OCA'],
  ['CC', 'OCA'],
  ['CX', 'OCA'],
  ['NF', 'OCA'],
  ['NZ', 'OCA'],

  ['FJ', 'OCM'],
  ['NC', 'OCM'],
  ['PG', 'OCM'],
  ['SB', 'OCM'],
  ['VU', 'OCM'],

  ['FM', 'OCN'],
  ['GU', 'OCN'],
  ['KI', 'OCN'],
  ['MH', 'OCN'],
  ['MP', 'OCN'],
  ['NR', 'OCN'],
  ['PW', 'OCN']
]);

exports.resolveRgnPath = function (rgn) {
  if (!rgnParent.has(rgn)) {
    return null;
  }

  let path = [rgn];
  let next = rgn;
  while (true) {
    if (!rgnParent.has(next)) {
      break;
    }

    next = rgnParent.get(next);
    path.unshift(next);
  }

  if (path[0] !== 'ROOT') {
    return null;
  }

  /* remove ROOT */
  path.shift();

  return path;
};

exports.isValidRgn = function (rgn) {
  return rgnParent.has(rgn);
};

exports.isValidCountry = function (country) {
  return country.length === 2 && rgnParent.has(country);
};
