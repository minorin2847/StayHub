export default class Amenity {
  name: string = "";
  icon: string = "";
  category: string = "";

  constructor(_: Partial<Amenity>) {
    Object.keys(this).forEach((key) => {
      const val = (_ as any)[key];
      if (val !== undefined) {
        (this as any)[key] = val;
      }
    });
  }
}
