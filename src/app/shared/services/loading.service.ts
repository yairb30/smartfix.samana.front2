import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private loadingOperations = new Set<string>();

  constructor() { }

  /**
   * Observable para suscribirse al estado de loading global
   */
  get isLoading$(): Observable<boolean> {
    return this.loadingSubject.asObservable();
  }

  /**
   * Obtiene el estado actual de loading
   */
  get isLoading(): boolean {
    return this.loadingSubject.value;
  }

  /**
   * Inicia una operación de loading
   * @param operationId Identificador único de la operación
   */
  startLoading(operationId: string = 'default'): void {
    this.loadingOperations.add(operationId);
    this.updateLoadingState();
  }

  /**
   * Finaliza una operación de loading
   * @param operationId Identificador único de la operación
   */
  stopLoading(operationId: string = 'default'): void {
    this.loadingOperations.delete(operationId);
    this.updateLoadingState();
  }

  /**
   * Finaliza todas las operaciones de loading
   */
  stopAllLoading(): void {
    this.loadingOperations.clear();
    this.updateLoadingState();
  }

  /**
   * Verifica si una operación específica está en loading
   * @param operationId Identificador de la operación
   */
  isOperationLoading(operationId: string): boolean {
    return this.loadingOperations.has(operationId);
  }

  /**
   * Obtiene todas las operaciones activas
   */
  getActiveOperations(): string[] {
    return Array.from(this.loadingOperations);
  }

  /**
   * Actualiza el estado global de loading
   */
  private updateLoadingState(): void {
    const isLoading = this.loadingOperations.size > 0;
    this.loadingSubject.next(isLoading);
  }

  /**
   * Wrapper para ejecutar una operación con loading automático
   * @param operation Función que retorna un Observable
   * @param operationId Identificador de la operación
   */
  withLoading<T>(
    operation: () => Observable<T>, 
    operationId: string = 'default'
  ): Observable<T> {
    return new Observable<T>(observer => {
      this.startLoading(operationId);
      
      const subscription = operation().subscribe({
        next: (value) => observer.next(value),
        error: (error) => {
          this.stopLoading(operationId);
          observer.error(error);
        },
        complete: () => {
          this.stopLoading(operationId);
          observer.complete();
        }
      });

      return () => {
        this.stopLoading(operationId);
        subscription.unsubscribe();
      };
    });
  }
}
