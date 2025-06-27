/**
 * @jest-environment jsdom
 */

import NewBill from "../containers/NewBill.js"

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    describe("when I upload a file with the wrong format", () => {
      test("then it should return an error message ", () => {
        const wrongFormatFile = new File(["hello"], "hello.txt", { type: "document/txt" })
        const mockGetElementById = jest.fn()
        const mockErrorObj = {};
        mockGetElementById.mockReturnValue(mockErrorObj)

        // Création d'un objet simulé avec des méthodes pour simuler le comportement attendu
        const documentMock = {
          querySelector: (s) => {
            console.log('querySelector with ', s)
            if (s === 'input[data-testid="file"]') {
              return {
                files: [wrongFormatFile],
                addEventListener: () => true,
              }
            } else {
              return { addEventListener: () => true }
            }
          },
          getElementById: mockGetElementById
        }
        const objInstance = new NewBill({
          document: documentMock,
          onNavigate: {},
          store: {},
          localStorage: {}
        })
        // Appel de la fonction handleChangeFile avec des valeurs simulées
        objInstance.handleChangeFile({ preventDefault: () => true, target: {value: 'hello.txt'} })
        // Vérification que la méthode getElementById a été appelée avec 'file-error' et mockErrorObj n'est pas vide
        expect(mockGetElementById).toHaveBeenCalledWith('file-error')
        expect(mockErrorObj.textContent).toBeTruthy()
      })
    })
  })
  describe("when I upload a file with the good format", () => {
    test("then it should save the user's email", () => {
      const mockGetElementById = jest.fn()
      mockGetElementById.mockReturnValue({})

      localStorage.setItem("user", '{"email" : "user@email.com"}')

      const createMock = jest.fn()
      const goodFormatFile = new File(['img'], 'image.png', { type: 'image/png' })

      const documentMock ={
        querySelector: (s) => {
          if (s === 'input[data-testid="file"]') {
            return {
              files: [goodFormatFile],
              addEventListener: () => true,
            }
          } else {
            return { addEventListener: () => true }
          }
        },
        getElementById: mockGetElementById
      }
      // Création d'un objet "store" simulé avec une méthode "create" qui renvoie une promesse résolue avec des données simulées
      const storeMock ={
        bills: () => {
          return {
            create: createMock.mockResolvedValue({fileUrl: "fileURL", key: "key"}) 
          }
        }
      }
      const objInstance = new NewBill({
        document: documentMock,
        onNavigate: {},
        store: storeMock,
        localStorage: {}
      });
      // Appel de la fonction handleChangeFile avec des valeurs simulées
      objInstance.handleChangeFile({
        preventDefault: () => true ,
        target: {value: "image.png"}
      })
      // Vérification que l'adresse e-mail stockée est correctement transmise dans les données lors de l'appel à la méthode "create"
      console.log('createMock.mock.calls[0][0].data', createMock.mock.calls[0][0].data)
      expect(createMock.mock.calls[0][0].data.get("email")).toEqual("user@email.com")
    })
  })
  describe('when submit new Bill', () => {
    test('then call update method on store', () => {

      const mockGetElementById = jest.fn()
      mockGetElementById.mockReturnValue({})

      localStorage.setItem("user", '{"email" : "user@email.com"}')

      // Création d'une fonction fictive pour la création de fichiers et d'un fichier image au bon format
      const createMock = jest.fn()
      const goodFormatFile = new File(['img'], 'image.png', { type: 'image/png' })

      // Création d'un objet document fictif avec les méthodes querySelector et getElementById
      const documentMock ={
        querySelector: (s) => {
          if (s === 'input[data-testid="file"]') {
            return {
              files: [goodFormatFile],
              addEventListener: () => true,
            }
          } else {
            return { addEventListener: () => true }
          }
        },
        getElementById: mockGetElementById
      }
      // Création d'une fonction de mise à jour fictive (mock) qui renvoie une résolution vide
      const mockUpdate = jest.fn();
      mockUpdate.mockResolvedValue({})
      // Création d'un store fictif avec une méthode bills qui renvoie un objet contenant la méthode update
      const storeMock ={
        bills: () => {
          return {
            update: mockUpdate
          }
        }
      }
      const objInstance = new NewBill({
        document: documentMock,
        onNavigate: () => {},
        store: storeMock,
        localStorage: {}
      });

      objInstance.handleSubmit({
        preventDefault: () => true ,
        target: {
          querySelector: (selector) => {
            switch(selector) {
              case 'select[data-testid="expense-type"]':
                return {value: 'typedefrais'}
                break;
              case 'input[data-testid="expense-name"]':
                return {value: 'nom'}
                break;
              case 'input[data-testid="amount"]':
                return {value: '12'};
                break;
              case 'input[data-testid="datepicker"]':
                return {value: 'date'};
                break;
              case 'input[data-testid="vat"]':
                return {value: 'tva'};
                break;
              case 'input[data-testid="pct"]':
                return {value: '34'};
                break;
              case 'textarea[data-testid="commentary"]':
                return {value: 'commentaire'}
                break;
            }
          }
        }
      })

      const dataToCheck = {
          email: 'user@email.com',
          type: 'typedefrais',
          name:  'nom',
          amount: 12,
          date:  'date',
          vat: 'tva',
          pct: 34,
          commentary: 'commentaire',
          fileUrl: null,
          fileName: null,
          status: 'pending'
      }
      // Analyse des données passées à la fonction
      const data = JSON.parse(mockUpdate.mock.calls[0][0].data);
      console.log('data?', data);

      expect(data).toMatchObject(dataToCheck)
    })
  })
})
