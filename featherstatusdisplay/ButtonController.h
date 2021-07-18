#ifndef BUTTON_CONTROLLER
#define BUTTON_CONTROLLER

#define BUTTON_A 11
#define BUTTON_B 12
#define BUTTON_C 13

enum Button
{
  ButtonNone,
  ButtonA,
  ButtonB,
  ButtonC
};

class ButtonController
{
protected:
  Button readButton();
  bool handled;

public:
  ButtonController(void);

  void update(void);
};

#endif // BUTTON_CONTROLLER