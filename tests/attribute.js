describe('Set the `src` attribute based on image width and its `data-borealis-srcs` attribute', function () {
  var elem = document.createElement('img'),
      style = document.createElement('style'),
      body = document.querySelector('body'),
      head = document.querySelector('head'),
      sizes = [],
      result;

  style.type = 'type/css';
  style.appendChild(document.createTextNode('img { max-width: 100%; height: auto; }'));

  body.appendChild(elem);
  head.appendChild(style);

  function random(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  beforeEach(function () {
    // Generate Sizes
    sizes.push(random(50, 400));
    sizes.push(random(405, 600));
    sizes.push(random(605, 900));

    // Remove State and Width
    elem.removeAttribute('src');
    body.style.width = '0px';


    // Set new sizes
    elem.setAttribute('data-borealis-srcs', 'http://www.fillmurray.com/' + (sizes[0] - 1) + '/300, ' + sizes[0] + ': http://www.fillmurray.com/' + sizes[0] + '/300, ' + sizes[1] + ': http://www.fillmurray.com/' + sizes[1] + '/300, ' + sizes[2] + ': http://www.fillmurray.com/' + sizes[2] + '/300');

    // Reset result
    result = null;
  });

  //////////////////////////////
  // No Sizes
  //////////////////////////////
  it('should use the default `src` if its width is smaller than smallest size', function () {
    body.style.width = (sizes[0] - 1) + 'px';

    borealis.refreshNodes();
    borealis.query(undefined, function () {
      result = elem.getAttribute('src');
      expect(result).toBe('http://www.fillmurray.com/' + (sizes[0] - 1) + '/300');
    });
  });

  //////////////////////////////
  // Small Sizes
  //////////////////////////////
  it('should be its smallest `src` when its width is equal to its smallest size', function () {
    body.style.width = (sizes[0]) + 'px';
    borealis.refreshNodes();
    borealis.query(undefined, function () {
      result = elem.getAttribute('src');
      expect(result).toBe('http://www.fillmurray.com/' + sizes[0] + '/300');
    });
  });

  it('should be its smallest `src` when its width is larger to its smallest size but smaller than its `medium` size', function () {
    body.style.width = (sizes[0] + 1) + 'px';
    borealis.refreshNodes();
    borealis.query(undefined, function () {
      result = elem.getAttribute('src');
      expect(result).toBe('http://www.fillmurray.com/' + sizes[0] + '/300');
    });
  });

  //////////////////////////////
  // Medium Sizes
  //////////////////////////////
  it('should be its medium `src` when its width is equal to its smallest size', function () {
    body.style.width = (sizes[1]) + 'px';
    borealis.refreshNodes();
    borealis.query(undefined, function () {
      result = elem.getAttribute('src');
      expect(result).toBe('http://www.fillmurray.com/' + sizes[1] + '/300');
    });
  });

  it('should be its medium `src` when its width is larger to its smallest size but smaller than its `medium` size', function () {
    body.style.width = (sizes[1] + 1) + 'px';
    borealis.refreshNodes();
    borealis.query(undefined, function () {
      result = elem.getAttribute('src');
      expect(result).toBe('http://www.fillmurray.com/' + sizes[1] + '/300');
    });
  });

  //////////////////////////////
  // Large Sizes
  //////////////////////////////
  it('should be its largest `src` when its width is equal to its smallest size', function () {
    body.style.width = (sizes[2]) + 'px';
    borealis.refreshNodes();
    borealis.query(undefined, function () {
      result = elem.getAttribute('src');
      expect(result).toBe('http://www.fillmurray.com/' + sizes[2] + '/300');
    });
  });

  it('should be its largest `src` when its width is larger to its smallest size but smaller than its `medium` size', function () {
    body.style.width = (sizes[2] + 1) + 'px';
    borealis.refreshNodes();
    borealis.query(undefined, function () {
      result = elem.getAttribute('src');
      expect(result).toBe('http://www.fillmurray.com/' + sizes[2] + '/300');
    });
  });
});
