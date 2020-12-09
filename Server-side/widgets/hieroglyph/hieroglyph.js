
var risposta = false;

export default {
    name: 'hieroglyph',
    template: `
            <link rel="stylesheet" href="/Server-side/hieroglyph/lock/hieroglyph.css">
            <div id="question"></div>
            <div class="lockContainer">
                <div id="zero" class="lockDigitContainer digit0">
                    <div class="lockDigit lockDigitPrev">9</div>
                    <div class="lockDigit lockDigitCur">0</div>
                    <div class="lockDigit lockDigitNext">1</div>
                </div>
                <div id="one" class="lockDigitContainer digit1">
                    <div class="lockDigit lockDigitPrev">9</div>
                    <div class="lockDigit lockDigitCur">0</div>
                    <div class="lockDigit lockDigitNext">1</div>
                </div>
                <div id="two" class="lockDigitContainer digit2">
                    <div class="lockDigit lockDigitPrev">9</div>
                    <div class="lockDigit lockDigitCur">0</div>
                    <div class="lockDigit lockDigitNext">1</div>
                </div>
                <div id="three" class="lockDigitContainer digit3">
                    <div class="lockDigit lockDigitPrev">9</div>
                    <div class="lockDigit lockDigitCur">0</div>
                    <div class="lockDigit lockDigitNext">1</div>
                </div>
            </div>
    `,
    methods: {
        render(question, answer) {
                let combination = []
                let start = [0,0,0,0]

                for(var i = 0 ; i < 4; i++) {
                   combination[i] = answer.charAt(i);
                } 
              
               $('#question').html(question);

               function ComboLock() {
                    this.mouseDownY = null;
                    this.mouseDownItem = null;
               }
    
            ComboLock.prototype.init = function() {
                var self = this;
                $(".lockDigitContainer").mousedown(function(evt) {
                    self.mouseDownItem = $(this);
                    self.mouseDownItem.addClass('depressed');
                    self.mouseDownY = evt.clientY;
                });
            
                $(document).mouseup(function(evt) {
                    if (self.mouseDownY)
                    {
                    var dir = 'down'
                    if (self.mouseDownY > evt.clientY)
                        var dir = 'up';
                    
                    self.rotateDirection(dir, self.mouseDownItem);
                    self.mouseDownItem.removeClass('depressed');
                    
                    self.mouseDownY = null;
                    self.mouseDownItem = null;
                    }
                });
            };
    
            ComboLock.prototype.rotateDirection = function(direction, item) {
                var checkdigit = 0;
                var newdigit = 9;
                var additiondigit = -1;
                if ('up' == direction){
                    checkdigit = 9;
                    newdigit = 0;
                    additiondigit = 1;
                }
    
                var p = parseInt(item.find('.lockDigitPrev').html());
                var c = parseInt(item.find('.lockDigitCur').html());
                var n = parseInt(item.find('.lockDigitNext').html());
                
                if(item[0].id =='zero') 
                    start[0] = p;
                if(item[0].id == 'one')
                    start[1] = p;
                if(item[0].id =='two') 
                    start[2] = p;
                if(item[0].id == 'three')
                    start[3] = p;
    
                p = (p == checkdigit) ? newdigit : p + additiondigit;
                c = (c == checkdigit) ? newdigit : c + additiondigit;
                n = (n == checkdigit) ? newdigit : n + additiondigit;

                if(start.toString() == combination.toString()) {
                    $('.lockDigitCur').addClass( "correct" );
                    document.getElementById("widgetNav").style.height = "0%";
                    risposta = true;
                }
    
                item.find('.lockDigitPrev').html(p);
                item.find('.lockDigitCur').html(c);
                item.find('.lockDigitNext').html(n);
            };
    
               var combo = new ComboLock();
               combo.init();
        },
        check() {
            return(risposta)
        }
      
    }
    
    
}