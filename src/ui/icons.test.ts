import { APP_ICONS, ICON_IDS } from './app-icons';
import { checkArt } from './svg-check';

describe('ícones do app', () => {
  it('todo ícone tem desenho e só formas seguras', () => {
    expect(Object.keys(APP_ICONS)).toEqual([...ICON_IDS]);
    ICON_IDS.forEach((id) => expect({ id, problems: checkArt(APP_ICONS[id]) }).toEqual({ id, problems: [] }));
  });
});
