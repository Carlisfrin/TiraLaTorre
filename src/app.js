var tipoMuro = 2;
var tipoBloque = 3;

var animales = {
  PANDA: 1,
  COCODRILO: 2,
  TIGRE: 3,
  KOALA: 4,
  MONO: 5,
};


var GameLayer = cc.Layer.extend({
    space:null,
    arrayBloques:[],
    spriteFondo: null,
    spriteLinea: null,
    spriteBarra: null,
    panel:null,
    formasEliminar: [],
    ctor:function () {
        this._super();
        var size = cc.winSize;

        // ZONA DE CACHE.
        cc.spriteFrameCache.addSpriteFrames(res.barra_3_plist);
        cc.spriteFrameCache.addSpriteFrames(res.animacioncocodrilo_plist);
        cc.spriteFrameCache.addSpriteFrames(res.animacionpanda_plist);
        cc.spriteFrameCache.addSpriteFrames(res.animaciontigre_plist);


        // Inicializar el espacio
        this.space = new cp.Space();
        this.space.gravity = cp.v( 0, -350);

        //this.depuracion = new cc.PhysicsDebugNode(this.space);
        //this.addChild(this.depuracion, 10);


        // Avisadores de colisiones
        this.space.addCollisionHandler(tipoMuro, tipoBloque, null, null, this.collisionBloqueConMuro.bind(this), null);
        this.space.addCollisionHandler(tipoBloque, tipoBloque, null, null, this.collisionBloqueConBloque.bind(this), null);




        // Muros
        var muroIzquierda = new cp.SegmentShape(this.space.staticBody,
            cp.v(0, 0),// Punto de Inicio
            cp.v(0, size.height),// Punto final
            10);// Ancho del muro
        this.space.addStaticShape(muroIzquierda);

        var muroArriba = new cp.SegmentShape(this.space.staticBody,
            cp.v(0, size.height),// Punto de Inicio
            cp.v(size.width, size.height),// Punto final
            10);// Ancho del muro
        this.space.addStaticShape(muroArriba);

        var muroDerecha = new cp.SegmentShape(this.space.staticBody,
            cp.v(size.width, 0),// Punto de Inicio
            cp.v(size.width, size.height),// Punto final
            10);// Ancho del muro
        this.space.addStaticShape(muroDerecha);

        var muroAbajo = new cp.SegmentShape(this.space.staticBody,
            cp.v(0, 0),// Punto de Inicio
            cp.v(size.width, 0),// Punto final
            10);// Ancho del muro
        muroAbajo.setFriction(1);
        muroAbajo.setCollisionType(tipoMuro);
        this.space.addStaticShape(muroAbajo);


        // Fondo
        this.spriteFondo = cc.Sprite.create(res.fondo_png);
        this.spriteFondo.setPosition(cc.p(size.width/2 , size.height/2));
        this.spriteFondo.setScale( size.width / this.spriteFondo.width );
        this.addChild(this.spriteFondo);

        // Panel
        this.panel = cc.LabelTTF.create("", "Arial", 20, cc.TEXT_ALIGNMENT_CENTER, cc.TEXT_ALIGNMENT_CENTER);
        this.panel.setPosition(size.width*0.2,cc.winSize.height/2);
        this.panel.setString("Apila los animales hasta\nla línea de puntos\n\nCada animal tiene distinto peso:\n"+
                                "Koala: 10 Kg\nMono: 50 Kg\nPanda: 100 Kg\nTigre: 200 Kg\nCocodrilo: 800 Kg");
        this.panel.setColor(cc.color.BLUE);
        this.addChild(this.panel);

        // Linea de puntos
        this.spriteLinea = cc.Sprite.create(res.linea_png);
        this.spriteLinea.setPosition(cc.p(size.width*0.7 , size.height*0.7));
        this.spriteLinea.setScaleX( 1/10 );
        this.spriteLinea.setScaleY( 1/50 );
        this.addChild(this.spriteLinea);

        // Agregar BARRA
        this.spriteBarra = new cc.PhysicsSprite("#barra_3.png");
        // body - cuerpo ES ESTATICO
        var body = new cp.StaticBody();
        body.p = cc.p( size.width*0.7  , size.height*0.3 );
        this.spriteBarra.setBody(body);
        //this.space.addBody(body); NO SE INCLUYEN LOS CUERPOS ESTATICOS
        // Forma
        var shape = new cp.BoxShape(body, this.spriteBarra.width, this.spriteBarra.height);
        shape.setFriction(10);
        this.space.addShape(shape); // adStaticShape sí son estaticos
        // Agregar el Sprite fisico
        this.addChild(this.spriteBarra);

        // Evento MOUSE
        cc.eventManager.addListener({
            event: cc.EventListener.MOUSE,
            onMouseDown: this.procesarMouseDown
        }, this);

        this.scheduleUpdate();
        return true;

    },procesarMouseDown:function(event) {
        // Ambito procesarMouseDown
        var instancia = event.getCurrentTarget();
        var canI = true;

        for(var i = 0; i < instancia.arrayBloques.length; i++) {
            if (instancia.arrayBloques[i].body.getPos().y > cc.winSize.height*0.8){
                canI = false;
            }
        }
        if (canI){

            var animal = Math.floor((Math.random() * 5) + 1);

            console.log(animal);

            // Crea el sprite
            switch (animal){
                case animales.PANDA:
                    var spriteBloque = new cc.PhysicsSprite("#panda1.png");
                    var body = new cp.Body(1, cp.momentForBox( 100, spriteBloque.width, spriteBloque.height )  );
                    break;
                case animales.COCODRILO:
                    var spriteBloque = new cc.PhysicsSprite("#cocodrilo1.png");
                    var body = new cp.Body(1, cp.momentForBox( 800, spriteBloque.width, spriteBloque.height )  );
                    break;
                case animales.TIGRE:
                    var spriteBloque = new cc.PhysicsSprite("#tigre1.png");
                    var body = new cp.Body(1, cp.momentForBox( 200, spriteBloque.width, spriteBloque.height )  );
                    break;
                case animales.KOALA:
                    var spriteBloque = new cc.PhysicsSprite(res.koala_1_png);
                    var body = new cp.Body(1, cp.momentForBox( 10, spriteBloque.width, spriteBloque.height )  );
                    break;
                case animales.MONO:
                    var spriteBloque = new cc.PhysicsSprite(res.mono_4_png);
                    var body = new cp.Body(1, cp.momentForBox( 50, spriteBloque.width, spriteBloque.height )  );
                    break;
                default:
                    break;
            }

            // body - cuerpo

            body.p = cc.p( event.getLocationX()  , event.getLocationY() );
            spriteBloque.setBody(body);
            instancia.space.addBody(body);

            // Forma
            var shape = new cp.BoxShape(body, spriteBloque.width, spriteBloque.height);
            shape.setFriction(1);

            instancia.space.addShape(shape);
            shape.setCollisionType(tipoBloque);

            // Agregar el Sprite fisico
            instancia.addChild(spriteBloque);

            instancia.arrayBloques.push(spriteBloque);
        }


     },update:function (dt) {
         this.space.step(dt);

         for(var i = 0; i < this.formasEliminar.length; i++) {
            var shape = this.formasEliminar[i];

            for (var j = 0; j < this.arrayBloques.length; j++) {
              if (this.arrayBloques[j].body.shapeList[0] == shape) {
                      // quita la forma
                      this.space.removeShape(shape);
                      // quita el cuerpo *opcional, funciona igual
                      this.space.removeBody(shape.getBody());
                      // quita el sprite
                      this.removeChild(this.arrayBloques[j]);
                      // Borrar tambien de ArrayBloques
                      this.arrayBloques.splice(j, 1);

              }
            }
        }
        this.formasEliminar = [];

     },
     collisionBloqueConMuro:function (arbiter, space) {
           var shapes = arbiter.getShapes();
           // shapes[0] es el muro
           this.formasEliminar.push(shapes[1]);
     },

     collisionBloqueConBloque:function (arbiter, space) {
          var shapes = arbiter.getShapes();
          // Comprobar si hemos acabado el nivel
          if ((shapes[1].body.getPos().y || shapes[0].body.getPos().y) > cc.winSize.height*0.7){
                console.log("GANAS!");
          }
     }

});

var GameScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        cc.director.resume();
        //cc.audioEngine.playMusic(res.sonidobucle_wav, true);
        var layer = new GameLayer();
        this.addChild(layer);
    }
});

