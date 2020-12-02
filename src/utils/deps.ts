export default class Deps {
  static testing = false;
  
  private static deps: any[] = [];

  static build(...types: any) {
    if (this.testing) return;
              
    for (const Type of types) {
      try { this.deps.push(new Type()); }
      catch {}
    }
  }

  static get<T>(type: any): T {    
    if (!type) return null;

    const service = this.deps.find(t => t instanceof type);
    return service || this.add(new type());
  }

  private static add<T>(instance: T): T {
    this.deps.push(instance);
    return instance;
  }
}
