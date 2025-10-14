import { Item } from './Item.js';
import { Lang, Translate, $ } from '../Const.js';

export class Inscription extends Item {
  constructor(data = {}) {
    super();

    this.type = 'Inscription';
    this.productid = dyo.monument._additions.Inscriptions[0].id;
    this.side = data.side;
    this.parent = data.parent;
    this.part = data.part;

    this.price = 0;
    this.label = data.label;
    this.font = data.font;

    if (data.font_size && data.font_family) {
      this.font_size = data.font_size;
      this.font_family = data.font_family;
      this.font = this.font_size + 'px ' + this.font_family;
    } else {
      let font = this.font.split('px ');
      if (dyo.engine.deviceType == 'mobile') {
        this.font_size = font[0] * 2;
      } else {
        this.font_size = font[0];
      }
      this.font_family = font[1];
      this.font = this.font_size + 'px ' + this.font_family;
    }

    if (data.colorName) {
      this.colorName = data.colorName;
    }
    if (data.color_texture) {
      this.color_texture = data.color_texture;
    }

    this.color = data.color;
    this.x = data.x;
    this.y = data.y;
    this.flipx = data.flipx;
    this.flipy = data.flipy;
    this.rotation = data.rotation;
    this.width = data.width;
    this.height = data.height;
    this.draggable = data.draggable;
    this.selected = data.selected;
    this.data = data;
    if (data.data3d) {
      this.data3d = data.data3d;
    } else {
      this.data3d = {};
    }

    if (this.flipx == undefined) {
      this.flipx = 1;
    }
    if (this.flipy == undefined) {
      this.flipy = 1;
    }

    if (this.rotation == undefined) {
      this.rotation = 0;
    }

    if (data.itemID && dyo.mode == '3d') {
      this.itemID = data.itemID;
    } else {
      this.itemID = dyo.monument.getItemID();
    }

    this.config();

    dyo.monument.addItem(this);

    let item = dyo.monument.getItemById(this.itemID);
  }

  render() {
    this.stage = this.parent.containers['Inscriptions_' + this.side];

    this.container = new createjs.Container();
    this.stage.addChild(this.container);

    this.cached_container = new createjs.Container();
    this.cached_container.visible = false;
    this.container.addChild(this.cached_container);

    if (this.color == undefined) {
      this.color = dyo.monument.getColor(this.color);
    }

    this.font_size = Number(this.font.split('px ')[0]);
    this.font_family = this.font.split('px ')[1];

    if (dyo.mode == '3d') {
      if (this.data.font_size == undefined) {
        this.font_size = 40;
      }
    }

    if (dyo.mode == '3d') {
      if (this.label == ' ') {
        this.label = ' ' + this.label;
      }
    }

    this.text = new createjs.Text(this.label, this.font, this.color);
    this.text.textAlign = 'center';
    this.text.textBaseline = 'middle';

    this.container.x = this.x;
    this.container.y = this.y;
    this.container.scaleX = this.flipx;
    this.container.scaleY = this.flipy;
    this.container.addChild(this.text);

    this.bounds = {};

    if (!this.ratio) {
      this.ratio = 1;
    }

    if (dyo.monument.id == 31) {
      this.colorTexture = new createjs.Container();
      this.overlayColorTexture = new createjs.Shape();
      this.colorTexture.addChild(this.overlayColorTexture);
      this.overlayColorTexture.cache(-dyo.w / 2, -dyo.h / 2, dyo.w, dyo.h);
      this.container.addChild(this.colorTexture);
    }

    if (this.draggable) {
      this.text.cursor = 'pointer';
      this.drag();

      this.selectOutline = new createjs.Shape();
      this.container.addChild(this.selectOutline);

      this.selectOutlineHandlers = new createjs.Shape();
      this.selectOutlineHandlers.name = 'handler';
      this.container.addChild(this.selectOutlineHandlers);
    }

    if (this.selected) {
      this.select();
    } else {
      this.selectOutline.visible = false;
      this.selectOutlineHandlers.visible = false;
    }

    this.resize();
    this.setRotation(this.rotation);
    this.cacheText('@render');

    if (dyo.mode == '3d') {
      this.add3D();
    }

    dyo.engine.inscriptions.slider_size.slider.value = this.font_size;
    dyo.monument.updateHeader('Inscription:398');

    dyo.selected = this;
  }

  setInst3d(model) {
    this.inst3d = model;
    this.ready3d = true;
  }

  applyColorTexture() {
    let _src;

    switch (this.productid) {
      default:
        dyo.engine.motifs.colors_list.show();

        if (this.color_texture == undefined) {
          _src = 'data/jpg/glass_backings/m/01defaultred.jpg';
        } else {
          _src = this.color_texture;
        }
        break;
      case 76:
        dyo.engine.motifs.colors_list.hide();

        _src = dyo.monument.headstone.texture;
        break;
    }

    if (this.last_color_texture != undefined) {
      if (this.color_texture == this.last_color_texture) {
        this.applyColorMask();
        return;
      }
    }

    this.color_texture = _src;

    let texture = new Image();
    texture.crossOrigin = 'Anonymous';
    texture.src = _src;

    dyo.engine.loader.show('Motif:290');

    texture.onerror = () => {
      console.log('Error');
      dyo.engine.loader.force = false;
      dyo.engine.loader.hide('Shape:939');
    };

    texture.onload = () => {
      this.last_color_texture = _src;

      let m = new createjs.Matrix2D();
      let v;

      v = 16;
      m.scale(v, v);

      let repeat = 'no-repeat';

      let container = this.colorTexture.getChildAt(0);
      container.graphics.clear();

      container.graphics
        .beginBitmapFill(texture, repeat, m)
        .drawRect(-(dyo.w / 2), -(dyo.h / 2), dyo.w * 8, dyo.h * 2);

      dyo.engine.loader.hide('Motif:290');

      this.applyColorMask();
    };
  }

  applyColorMask() {
    var self = this;

    this.text.alpha = 0.01;

    this.overlayColorTexture.filters = [
      new createjs.AlphaMaskFilter(this.text.cacheCanvas),
    ];

    this.overlayColorTexture.cache(0, 0, this.bounds.width, this.bounds.height);

    this.colorTexture.x = -(this.bounds.width / 2);
    this.colorTexture.y = -(this.bounds.height / 2);
  }

  add3D() {
    if (dyo.edit == false) {
      let self = this;
      this.inst3d = new Engine3D.Model3D('models/motif-container.m3d');
      dyo.engine3d.inst3d = this.inst3d;

      this.inst3d.addEventListener(
        Engine3D.Model3DEvent.IS_READY,
        function (e) {
          if (dyo.engine3d.currentModel.generalType) {
            switch (dyo.engine3d.currentModel.generalType.toLowerCase()) {
              default:
                dyo.engine3d.currentModel = dyo.engine3d.headstone3d;
                break;
              case 'ledger':
                dyo.engine3d.currentModel = dyo.engine3d.ledger3d;
                break;
            }
          } else {
            dyo.engine3d.currentModel = dyo.engine3d.headstone3d;
          }

          let canvas = document.createElement('canvas');
          canvas.width = 128;
          canvas.height = 128;

          if (this.text) {
            canvas = this.text.cacheCanvas;
          }

          let object = new Engine3D.values.DisplayObjectValue(canvas);
          object.setEmbedType(Engine3D.enums.EmbedType.EMBEDDED);

          dyo.engine3d.currentModel.addChild(self.inst3d);

          let extra = self.inst3d.getExtraData();

          let xml = document.implementation.createDocument('', '', null);
          let data = xml.createElement('data');

          data.setAttribute('type', 'inscription');
          xml.appendChild(data);

          self.inst3d.extra = { id: Number(self.itemID) };

          let color = parseInt(self.color.replace('#', ''), 16);
          self.inst3d.changeProperty('color', color);

          self.ready3d = true;

          if (self.data3d['height'] == undefined) {
            self.data3d['height'] = 40;
          }

          self.inst3d.changeProperty('display_object', object);
          self.inst3d.changeProperty('height', Number(self.data3d['height']));
          self.inst3d.changeProperty('layer', 9000 + Number(self.itemID));

          if (self.inst3d.getSelectionObject().getType() == 'surface') {
            self.inst3d.getSelectionObject().setRotatable(false);
          }

          self.updateSlider(self.data3d['height']);

          if (dyo.engine.deviceType == 'mobile') {
            //Engine3D.Controller.getCurrentProject().setSelectedModel(dyo.engine3d.headstone3d);
            self.inst3d.setSelected(false);
          } else {
            self.inst3d.setSelected(true);
          }

          if (self.data.y) {
            let region = self.inst3d.getParentRegion();
            let modelPosition = region.getModelRegionPosition(self.inst3d);

            modelPosition.set_x(self.data.x);
            modelPosition.set_y(self.data.y);
            modelPosition.set_rotation(self.data.rotation);
          }

          self.select();
          self.update();
          self.addEvents3D();
        },
      );
    }
  }

  addEvents3D() {
    let self = this;

    if (this.events3D) {
      return;
    }

    self.inst3d.addEventListener(
      Engine3D.Model3DPropertyEvent.CHANGE,
      function (e) {
        if (e.getPropertyId() != 'display_object') {
          self.data3d[e.getPropertyId()] = e.getPropertyValue();
          if (e.getPropertyId() == 'height') {
            let size = Math.round(self.data3d[e.getPropertyId()]);

            if (size > self.max_height) {
              size = self.max_height;
            }

            if (size < self.min_height) {
              size = self.min_height;
            }

            self.inst3d.changeProperty('height', Number(size));

            self.setSize(e.getPropertyValue(), '3d event');
          }
        }
      },
    );

    self.inst3d.addEventListener(
      Engine3D.Model3D.EVENT_INTERNAL_MODEL_SELECTED,
      function (e) {
        dyo.last_url = 'add-your-inscription';
        self.data3d['height'] = self.inst3d.getProperty('height');
        self.select();
      },
    );

    this.events3D = true;
  }

  set fontFamily(family) {
    this.font_family = family;
    dyo.selected.text.font = this.font_size + 'px ' + this.font_family;
    this.setSize(this.font_size);

    if (dyo.mode == '3d') {
      this.cacheText('@fontFamily');
      var object = new Engine3D.values.DisplayObjectValue(
        this.text.cacheCanvas,
      );
      object.setEmbedType(Engine3D.enums.EmbedType.EMBEDDED);
      let old_font_size = this.font_size;
      this.inst3d.changeProperty('display_object', object);
      this.inst3d.changeProperty('height', Number(old_font_size));
    }
  }

  setY(_y) {
    this.y = _y;
  }

  getFont() {
    return this.font_size + 'px ' + this.font_family;
  }

  getFontFamily() {
    return this.font_family;
  }

  getDividableBy5(value) {
    let output;

    for (let nr = 0; nr < 200; nr++) {
      if (value >= nr * 5) {
        output = nr * 5;
      }
    }

    return output;
  }

  config() {
    let _config = dyo.monument._additions.Inscriptions[0];
    this.min_height = Number(_config.min_height);
    this.max_height = Number(_config.max_height);
    this.init_height = Number(_config.init_height);
  }

  get_min() {
    return this.min_height;
  }

  get_max() {
    return this.max_height;
  }

  getRotation() {
    return this.rotation;
  }

  increase() {
    if (dyo.selected) {
      let size = this.font_size;
      if (dyo.usa) {
        size += 2;
      } else {
        size += 1;
      }

      if (size > this.max_height) {
        size = this.max_height;
      }

      this.setSize(size);

      if (dyo.mode == '3d') {
        if (dyo.engine3d.inst3d) {
          dyo.engine3d.inst3d.changeProperty('height', Number(size));
        }
      }
    }
  }

  decrease() {
    dyo.engine.inscriptions.enhanceMinHeight();
    if (dyo.selected) {
      let size = this.font_size;
      if (dyo.usa) {
        size -= 2;
      } else {
        size -= 1;
      }
      if (size < dyo.engine.inscriptions.slider_size.slider.min) {
        size = dyo.engine.inscriptions.slider_size.slider.min;
      }
      this.setSize(size);

      if (dyo.mode == '3d') {
        if (dyo.engine3d.inst3d) {
          dyo.engine3d.inst3d.changeProperty('height', Number(size));
        }
      }
    }
  }

  getPrice() {
    return this.price;
  }

  setColor(color) {
    this.color = color;
    this.applyColor(this.color);
  }

  set colorName(name) {
    this._colorName = name;
  }

  get colorName() {
    return this._colorName;
  }

  countChars() {
    return this.text.text.replace(/\s/g, '').length;
  }

  delete(from) {
    let self = this;

    dyo.monument.removeItem(this);
    dyo.engine.inscriptions.reset();

    this.container.removeEventListener('mouseover');
    this.container.removeEventListener('mouseout');
    this.container.removeEventListener('mousedown');
    this.container.removeEventListener('pressmove');

    this.container.removeAllChildren();

    dyo.engine.canvas.stage.update();

    if (dyo.mode == '3d') {
      setTimeout(function () {
        if (self.inst3d) {
          self.inst3d.removeFromParent();
        }
      }, 500);
    }

    this.deleted = true;
    dyo.selected = null;
    dyo.currentSection = 'Design Menu';
    dyo.monument.updateHeader('Emblem:398');

    dyo.engine.designSaved = false;
  }

  resize() {
    if (!this.deleted) {
      this.setSize(this.font_size);
    }
  }

  set size(size) {
    this.setSize(Number(size.split(' ')[0]));
  }

  getHeight() {
    if (dyo.mode == '3d') {
      return Math.round(this.font_size);
    } else {
      let h = Math.round(this.font_height / dyo.monument.getRatio());
      if (isNaN(h)) {
        h = 10;
      }

      return h;
    }
  }

  setSize(size) {
    let ratio = dyo.monument.getRatio();

    if (size < dyo.engine.inscriptions.slider_size.slider.min) {
      size = dyo.engine.inscriptions.slider_size.slider.min;
    }

    if (size > this.max_height) {
      size = this.max_height;
    }

    this.font_size = size;

    if (dyo.resizing) {
      dyo.engine.canvas.calc_context.font =
        this.font_size * ratio + 'px ' + this.font_family;
      let textMetrics = dyo.engine.canvas.calc_context.measureText(
        this.text.text,
      );

      let w = this.cached_container.regX * 2;
      this.cached_container.scaleX = this.cached_container.scaleY =
        textMetrics.width / w;

      if (dyo.mode == '2d') {
        this.update();
      }
    } else {
      if (dyo.monument.headstone.maxY == undefined) {
        dyo.monument.headstone.maxY = dyo.h;
      }
      if (dyo.monument.headstone.maxX == undefined) {
        dyo.monument.headstone.maxX = dyo.w;
      }

      this.text.font = this.font_size * ratio + 'px ' + this.font_family;

      if (dyo.mode == '3d') {
        this.text.font = 200 * ratio + 'px ' + this.font_family;
      }
      dyo.engine.canvas.calc_context.font = this.text.font;

      this.updateSize();

      if (dyo.mode == '2d') {
        this.update();
      }
    }

    if (dyo.mode == '3d') {
      if (this.inst3d) {
        if (Engine3D.Controller) {
          if (Engine3D.Controller.getCurrentProject()) {
            this.font_height = this.inst3d.getProperty('height');

            if (dyo.controller_Size) {
              let _height = Math.round(this.font_height);

              if (!isNaN(_height)) {
                if (dyo.metric == 'inches') {
                  $(
                    '#dyo_slider_font_height_value',
                    Translate(Lang.SIZE) +
                      ': ' +
                      dyo.engine.metrics.toInch(_height),
                  );
                } else {
                  $(
                    '#dyo_slider_font_height_value',
                    Translate(Lang.SIZE) + ': ' + _height + ' MM',
                  );
                }
              }
            }
          }
        }
      }
    }

    if (dyo.monument.id == 31) {
      this.applyColorTexture();
    }

    dyo.monument.updateHeader('inscription:482');
  }

  updateSize() {
    if (dyo.controller_Size) {
      dyo.prevSection = dyo.currentSection;
      dyo.currentSection = 'Inscriptions';
      if (this.font_size != this.old_font_size) {
        dyo.controller_Size.setValue(this.font_size);
        this.old_font_size = this.font_size;
      }
      dyo.currentSection = dyo.prevSection;
    }
  }

  update() {
    if (dyo.design.loadQueueState == false) {
      if (dyo.mode == '3d') {
        if (this.text.text != this.old_text) {
          this.cacheText('@update');
          this.old_text = this.text.text;

          if (this.inst3d) {
            if (this.ready3d) {
              if (this.text.cacheCanvas) {
                var object = new Engine3D.values.DisplayObjectValue(
                  this.text.cacheCanvas,
                );
                object.setEmbedType(Engine3D.enums.EmbedType.EMBEDDED);

                let old_font_size = this.font_size;
                this.inst3d.changeProperty('display_object', object);
                this.inst3d.changeProperty('height', Number(old_font_size));
              }
            }
          }
        }
        this.updateSlider(Math.round(this.font_size));
      } else {
        this.cacheText('@update');
      }
    }

    let self = this;

    if (!this.deleted) {
      dyo.monument.updateItem(this);
    }

    dyo.monument.updateHeader('inscription:525');
  }

  setRotation(rotate) {
    this.rotation = rotate;

    if (dyo.controller_Rotate) {
      dyo.controller_Rotate.setValue(this.getRotation());
    }

    this.container.rotation = this.rotation;

    if (dyo.mode == '3d') {
      if (this.inst3d) {
        let region = this.inst3d.getParentRegion();
        let modelPosition = region.getModelRegionPosition(this.inst3d);
        modelPosition.set_rotation(rotate);
      }
    }
  }

  getCacheId() {
    return dyo.engine.md5(JSON.stringify(this.text.text + this.text.font));
  }

  cacheText(from) {
    if (from) {
      //console.log(from + "::" + this.itemID);
    }

    if (dyo.resizing) {
      this.cached_container.visible = true;
      this.text.visible = false;
      if (dyo.monument.id == 31 || dyo.monument.id == 37) {
        this.colorTexture.visible = false;
      }
      return;
    } else {
      this.cached_container.visible = false;
      this.text.visible = true;
      if (dyo.monument.id == 31 || dyo.monument.id == 37) {
        this.colorTexture.visible = true;
      }
    }

    if (this.text != '') {
      let cache = dyo.engine.canvas.cachedCanvas;
      let cacheId = this.getCacheId();
      let textMetrics;

      if (cache[cacheId] == undefined) {
        if (
          this.text.font.indexOf('0px') == -1 &&
          this.text.font.indexOf('NaNpx') == -1
        ) {
          dyo.engine.canvas.calc_context.font = this.text.font;

          if (dyo.monument.headstone.maxY > 0) {
            textMetrics = dyo.engine.canvas.measureText(this.text.text, 'dyo');
          }
        }

        cache[cacheId] = textMetrics;
      } else {
        textMetrics = cache[cacheId];
      }

      if (
        this.text.font.indexOf('0px') == -1 &&
        this.text.font.indexOf('NaNpx') == -1
      ) {
        if (dyo.monument.headstone.maxY > 0) {
          this.bounds.left = textMetrics.actualBoundingBoxLeft;
          this.bounds.right = textMetrics.actualBoundingBoxRight;
          this.bounds.top = textMetrics.actualBoundingBoxAscent;
          this.bounds.bottom = textMetrics.actualBoundingBoxDescent;
          this.bounds.width = this.bounds.right + this.bounds.left;
          this.bounds.height = this.bounds.bottom + this.bounds.top;

          this.text.cache(
            -this.bounds.left,
            -this.bounds.top,
            this.bounds.width,
            this.bounds.height,
          );

          let bitmap = new createjs.Bitmap(this.text.cacheCanvas);
          this.cached_container.addChild(bitmap);
          this.cached_container.regX = this.bounds.width / 2;
          this.cached_container.regY = this.bounds.height / 2;
        }
      }

      if (dyo.resizing != true) {
        this.drawOutline();
        this.drawHandlers();

        this.font_height = this.bounds.bottom + this.bounds.top;

        if (dyo.controller_Size) {
          let _height = Math.round(this.font_height / dyo.monument.getRatio());

          //console.log(this.font_height, _height, this.font_height);

          if (dyo.mode != '3d') {
            if (!isNaN(_height)) {
              if (dyo.metric == 'inches') {
                $(
                  '#dyo_slider_font_height_value',
                  Translate(Lang.SIZE) +
                    ': ' +
                    dyo.engine.metrics.toInch(_height),
                );
              } else {
                $(
                  '#dyo_slider_font_height_value',
                  Translate(Lang.SIZE) + ': ' + _height + ' MM',
                );
              }
            }
          }
        }
      }

      if (dyo.monument.id == 31) {
        this.applyColorTexture();
      }
    }
  }

  updateSlider(_height) {
    _height = Math.round(_height);

    if (!isNaN(_height)) {
      if (dyo.metric == 'inches') {
        $(
          '#dyo_slider_font_height_value',
          Translate(Lang.SIZE) + ': ' + dyo.engine.metrics.toInch(_height),
        );
      } else {
        $(
          '#dyo_slider_font_height_value',
          Translate(Lang.SIZE) + ': ' + _height + ' MM',
        );
      }

      dyo.engine.inscriptions.slider_size.slider.value = _height;
    }
  }

  select() {
    dyo.currentSection = 'Inscriptions';
    dyo.last_url = 'add-your-inscription';

    //if (this.text.text != "") {

    if (dyo.mode == '3d') {
      if (this.inst3d) {
        this.inst3d.changeProperty(
          'layer',
          9000 + Number(dyo.monument.getItemID()),
        );
        dyo.engine3d.inst3d = this.inst3d;
      }
    }

    document.location.href = '#inscription-' + this.itemID;

    dyo.engine.hide();

    dyo.engine.inscriptions.input.text_field.value = this.text.text;

    if (dyo.engine.deviceType == 'desktop') {
      $('#dyo_textfield').focus();
    }

    let family = this.text.font.split('px ')[1];
    dyo.engine.inscriptions.font_family.select.selectedIndex =
      dyo.engine.inscriptions.font_family.getId(family);

    dyo.monument.deselectAll();
    dyo.selected = this;
    this.selectOutline.visible = true;
    this.selectOutlineHandlers.visible = true;

    dyo.engine.inscriptions.show();

    this.updateSize();
    this.setRotation(this.rotation);

    if (dyo.mode == '3d') {
      this.updateSlider(Math.round(this.font_size));
    } else {
      this.cacheText('@select');
    }

    dyo.engine.inscriptions.slider_size.slider.min = Number(
      dyo.config._additions.Inscriptions[0].min_height,
    );
    dyo.engine.inscriptions.slider_size.slider.max = Number(
      dyo.config._additions.Inscriptions[0].max_height,
    );

    if (dyo.local == false) {
      dyo.engine.inscriptions.enhanceMinHeight();
    }

    dyo.engine.inscriptions.slider_size.slider.value = this.font_size;

    dyo.engine.inscriptions.slider_rotation.slider.value = this.rotation;

    if (dyo.engine.deviceType != 'mobile') {
      if (dyo.engine.drawer.drawer.open == false) {
        dyo.engine.drawer.drawer.open = true;
      }
    }

    this.stage.setChildIndex(this.container, this.stage.numChildren - 1);

    dyo.engine.canvas.showButtons();

    dyo.monument.updateHeader('inscription:711');

    //}
  }

  deselect() {
    dyo.selected = null;
    this.selectOutline.visible = false;
    this.selectOutlineHandlers.visible = false;
    this.applyColor(this.color);
  }

  duplicate(data) {
    this.deselect();
    this.cacheText('@duplicate');

    let label = this.text.text;

    if (data) {
      if (data.label != undefined) {
        label = data.label;
      }
    }

    let _x, _y;

    if (dyo.mode == '3d') {
      let parent = this.inst3d.getParent();
      let region = this.inst3d.getParentRegion();
      let modelPosition = region.getModelRegionPosition(this.inst3d);
      let rotate = this.container.rotation;

      switch (parent.getGeneralType()) {
        default:
          dyo.engine3d.currentModel = dyo.engine3d.headstone3d;
          break;
        case 'Scenery':
          dyo.engine3d.currentModel = dyo.engine3d.currentModel.lastGeneralType;
          break;
        case 'lid':
          dyo.engine3d.currentModel = dyo.engine3d.ledger3d;
          break;
      }

      switch (rotate) {
        default:
          _x = modelPosition.get_x();
          _y = modelPosition.get_y() + this.inst3d.getProperty('height');
          break;
        case -90:
        case 90:
          _x = modelPosition.get_x() - this.inst3d.getProperty('height');
          _y = modelPosition.get_y();
          break;
      }
    } else {
      _x = this.container.x;
      _y = this.container.y + this.bounds.height;
    }

    dyo.engine.inscriptions.lastY = _y;

    this.old_text = undefined;

    let inscription = new Inscription({
      data3d: this.data3d,
      side: this.side,
      label: label,
      font: this.text.font,
      font_size: this.font_size,
      font_family: this.font_family,
      color: this.color,
      color_texture: this.color_texture,
      colorName: this.colorName,
      x: _x,
      y: _y,
      rotation: this.rotation,
      flipx: this.flipx,
      flipy: this.flipy,
      draggable: true,
      selected: true,
      scale: 1,
    });

    this.parent.add(inscription);

    dyo.engine.designSaved = false;
  }

  applyColor(hex) {
    if (dyo.selected) {
      this.color = hex;

      if (dyo.mode == '2d') {
        if (dyo.selected) {
          dyo.selected.text.color = hex;
        }
        this.update();
        this.text.cache(
          -this.bounds.left,
          -this.bounds.top,
          this.bounds.width,
          this.bounds.height,
        );
      }

      if (dyo.mode == '3d') {
        if (this.inst3d) {
          var object = new Engine3D.values.DisplayObjectValue(
            this.text.cacheCanvas,
          );
          object.setEmbedType(Engine3D.enums.EmbedType.EMBEDDED);
          let old_font_size = this.font_size;
          this.inst3d.changeProperty('display_object', object);
          this.inst3d.changeProperty('height', Number(old_font_size));

          let color = parseInt(hex.replace('#', ''), 16);
          this.inst3d.changeProperty('color', color);
        }
      }

      dyo.monument.updateHeader('inscription:995');
    }
  }

  setPosition(point) {
    this.container.x = point.x;
    this.container.y = point.y;
  }

  getPosition() {
    let point = { x: this.data.x, y: this.data.y };
    return point;
  }

  strip(str) {
    let s = str.split(' ');
    return s.join('');
  }

  serialize(json) {
    const self = {};

    self.productid = dyo.monument._additions.Inscriptions[0].id;
    self.name = dyo.monument._additions.Inscriptions[0].name;
    self.type = this.type;
    if (this.part) {
      self.part = this.part;
    } else {
      self.part = this.parent.type;
    }
    self.side = this.side;
    self.price = this.price;
    self.quantity = this.strip(this.text.text).length;
    self.label = this.text.text.replace("'", '&apos;');

    let regex = `'`;
    self.label = self.label.replaceAll(new RegExp(regex, 'gi'), '&apos;');

    self.font = this.text.font;
    self.font_size = this.font_size;
    self.font_family = this.font_family;

    self.color = this.color;
    self.colorName = this.colorName;
    self.x = this.container.x;
    self.y = this.container.y;
    self.rotation = this.rotation;
    self.flipx = this.flipx;
    self.flipy = this.flipy;
    self.height = this.getHeight();
    self.itemID = this.itemID;

    if (dyo.monument.id == 31) {
      self.color_texture = this.color_texture;
    }

    if (json) {
      return JSON.stringify(self);
    } else {
      return self;
    }
  }
}
