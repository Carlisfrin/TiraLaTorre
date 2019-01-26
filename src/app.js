var tipoMuro = 2;
var tipoBloque = 3;



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


        // Inicializar el espacio
        this.space = new cp.Space();
        this.space.gravity = cp.v( 0, -350);

        //this.depuracion = new cc.PhysicsDebugNode(this.space);
        //this.addChild(this.depuracion, 10);


        // Avisadores de colisiones
        this.space.addCollisionHandler(tipoMuro, tipoBloque,
                         null, null, this.collisionBloqueConMuro.bind(this), null);




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
        this.panel.setString("Apila los animales hasta\nla línea de puntos");
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
        shape.setFriction(1);
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

        // event.getLocationX() y event.getLocationY()
        var spriteBloque = new cc.PhysicsSprite("#panda1.png");

        // body - cuerpo
        var body = new cp.Body(1, cp.momentForBox( 10000, spriteBloque.width, spriteBloque.height )  );

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


     },collisionBloqueConMuro:function (arbiter, space) {
           var shapes = arbiter.getShapes();
           // shapes[0] es el muro
           this.formasEliminar.push(shapes[1]);
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

