import { ZF2ModelGenPage } from './app.po';

describe('zf2-model-gen App', function() {
  let page: ZF2ModelGenPage;

  beforeEach(() => {
    page = new ZF2ModelGenPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
