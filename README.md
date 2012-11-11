# Blocks.js
A small platform game engine driven by JavaScript / DOM.

Check out the demo here: http://mt111102.students.fhstp.ac.at/lv-meta/projekt/web/

<pre>
// create engine and add the viewport

var Engine = new Engine2('jumptastic',config);
Engine.addViewport('body','viewport');

// add an intro image and start button

var imgSrc = 'img/tutorial.jpg';
Engine.addIntroductionImage(imgSrc);
Engine.addStartButton('start_button','Let\'s Jump!');

//override some default configurations

Engine.setGravity(5);
Engine.setPlayerSpeed(5);
Engine.setElevatorSpeed(1);
</pre>