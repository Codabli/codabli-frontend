import { AUTOSAVE_DELAY_MS, Autosave } from './autosave';

describe('Autosave', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('enregistre une seule fois après une série de modifications', () => {
    const save = vi.fn().mockReturnValue(true);
    const autosave = new Autosave(save);

    autosave.schedule();
    vi.advanceTimersByTime(AUTOSAVE_DELAY_MS - 1);
    autosave.schedule();
    vi.advanceTimersByTime(AUTOSAVE_DELAY_MS);

    expect(save).toHaveBeenCalledTimes(1);
    expect(autosave.status()).toBe('saved');
    expect(autosave.savedAt()).toBeInstanceOf(Date);
  });

  it('enregistre tout de suite une modification en attente', () => {
    const save = vi.fn().mockReturnValue(true);
    const autosave = new Autosave(save);

    autosave.schedule();
    autosave.flush();

    expect(save).toHaveBeenCalledTimes(1);
  });

  it('ne fait rien au flush s\'il n\'y a rien en attente', () => {
    const save = vi.fn().mockReturnValue(true);

    new Autosave(save).flush();

    expect(save).not.toHaveBeenCalled();
  });

  it('signale un enregistrement impossible', () => {
    const autosave = new Autosave(() => false);

    autosave.schedule();
    vi.advanceTimersByTime(AUTOSAVE_DELAY_MS);

    expect(autosave.status()).toBe('error');
    expect(autosave.savedAt()).toBeNull();
  });
});
