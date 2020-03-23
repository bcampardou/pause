import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable()
export class StateService {
    public isMac = false;
    public isApplicationPointed$ = new BehaviorSubject<boolean>(false);
    constructor() { }
}
