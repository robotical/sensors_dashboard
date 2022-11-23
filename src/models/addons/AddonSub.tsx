export default class AddonSub {
    name: string;
    value: number;
    selected: boolean;
    selectedListener: (() => void) | null = null;
  
    constructor(name: string, value: number) {
      this.name = name;
      this.value = value;
      this.selected = false;
    }
  
    setSelectedListener(
      selectedListener: () => void
    ) {
      this.selectedListener = () => {
        // updating react state
        selectedListener();
  
        // updating selected value
        this.selected = !this.selected;
      };
    }
  }