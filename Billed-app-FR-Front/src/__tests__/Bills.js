/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import Bills from "../containers/Bills.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"
import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon.classList.contains('active-icon')).toBe(true)

    });
    test("Then bills should be ordered from earliest to latest", () => {
    document.body.innerHTML = BillsUI({ data: bills })
      //Récupère tous les éléments selon la regex et extrait le contenu HTML
      const dateElements = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(element => element.textContent);
      //Crée un nouveau tableau et extrait juste le contenu 
      const dates = Array.from(dateElements).map(element => element.textContent);
      // Définit une fonction de tri et tri les dates
      const antiChrono = (a, b) => ((a < b) ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    }); 
  })
  describe("When the function handleClickIconEye() of class Bills is used", () => {
    test("Then it should open modal", () => {
      // Crée un élément simulé pour la fenêtre modale
      const modal = document.createElement("div");
      modal.setAttribute("id", "modaleFile");
  
      // Crée un élément simulé pour le contenu de la fenêtre modale
      const modalContent = document.createElement("div");
      modalContent.setAttribute("class", "modal-body");
      modal.append(modalContent);
      document.body.append(modal);
  
      // Crée une fonction mock pour la méthode modal de jQuery
      const mockFn = jest.fn((arg) => true);
  
      // Attribue la fonction mock à la méthode modal de jQuery globalement
      global.$.fn.modal = mockFn;
  
      // Crée un objet simulé documentMock pour les méthodes de sélection
      const documentMock = {
        querySelector: () => null,
        querySelectorAll: () => null,
      };
  
      // Crée un objet simulé storeMock pour la méthode list
      const storeMock = {
        bills: () => ({
          list: () => ({
            then: (fn) => fn(bills),
          }),
        }),
      };
  
      // Crée une instance simulée de la classe Bills avec les mocks
      const billsObject = new Bills({
        document: documentMock,
        onNavigate: {},
        store: storeMock,
        localStorage: {},
      });
  
      // Appelle la méthode handleClickIconEye avec un attribut fictif
      billsObject.handleClickIconEye({ getAttribute: () => "fakeUrl" });
  
      // Vérifie si la fonction mock a été appelée une fois
      expect(mockFn.mock.calls).toHaveLength(1);
    }); 
  });
  describe("When I click on the new expense report button", () => {
    test("Then it should call onNavigate with the correct route", () => {
      // Créez une fonction mock pour onNavigate
      const mockOnNavigate = jest.fn();
  
      // Créez un objet Bills avec le mock onNavigate
      const billsObject = new Bills({
        document,
        onNavigate: mockOnNavigate,
        store: {},
        localStorage: {},
      });
  
      // Appelez la fonction handleClickNewBill
      billsObject.handleClickNewBill();
  
      // Vérifiez si onNavigate a été appelée avec la bonne route
      expect(mockOnNavigate).toHaveBeenCalledWith(ROUTES_PATH["NewBill"]);
    });
    test("Then return unformatted date, if corrupted data was introduced", () => {
      const corruptedBills = [{
      "status": "refused",
      "date": "unformatted date"
      }];
  
      // Crée un objet simulé storeMock avec une méthode list qui retourne les factures corrompues
    const storeMock = {
      bills: () => {
        return {
          list: () => {
            return {
              then: (fn) => fn(corruptedBills),
            };
          },
        };
      },
    };
  
    // Crée une instance simulée de la classe Bills avec les mocks
    const billsObject = new Bills({
      document,
      onNavigate: {},
      store: storeMock,
      localStorage: {},
    });
  
    // Appelle la méthode getBills() pour obtenir les factures corrompues
    const testBillsError = billsObject.getBills();
  
    // Définit les données de factures attendues avec un statut "Refused" et une date non formatée
    const expectedBillsError = [{ status: 'Refused', date: 'unformatted date' }];
  
    // Vérifie si les factures obtenues correspondent aux données attendues
    expect(testBillsError).toEqual(expectedBillsError);
    });
  });  
})