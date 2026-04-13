export default class Policy {
  name: string = "";
  description: string = "";
  category: string = "";
  status: boolean = true;
  updated_at: string = "";

  constructor(_: Partial<Policy>) {
    Object.keys(this).forEach((key) => {
      const val = (_ as any)[key];
      if (val !== undefined) {
        (this as any)[key] = val;
      }
    });
  }
}