/**
 * @jest-environment jsdom
 */

import NewBill from "../containers/NewBill.js"
import mockStore from "../__mocks__/store.js"

jest.mock("../app/Store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    describe("when I upload a file with the wrong format", () => {
      test("then it should return an error message ", () => {
        const wrongFormatFile = new File(["hello"], "hello.txt", { type: "document/txt" })
        const mockGetElementById = jest.fn()
        const mockErrorObj = {};
        mockGetElementById.mockReturnValue(mockErrorObj)

        const documentMock = {
          querySelector: (s) => {
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
        objInstance.handleChangeFile({ preventDefault: () => true, target: {value: 'hello.txt'} })
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
      objInstance.handleChangeFile({
        preventDefault: () => true ,
        target: {value: "image.png"}
      })
      expect(createMock.mock.calls[0][0].data.get("email")).toEqual("user@email.com")
    })
  })

  describe('when submit new Bill', () => {
    test('then call update method on store', () => {
      const mockGetElementById = jest.fn()
      mockGetElementById.mockReturnValue({})

      localStorage.setItem("user", '{"email" : "user@email.com"}')

      const goodFormatFile = new File(['img'], 'image.png', { type: 'image/png' })

      const documentMock ={
        querySelector: (s) => {
          const inputs = {
            'select[data-testid="expense-type"]': { value: 'typedefrais' },
            'input[data-testid="expense-name"]': { value: 'nom' },
            'input[data-testid="amount"]': { value: '12' },
            'input[data-testid="datepicker"]': { value: 'date' },
            'input[data-testid="vat"]': { value: 'tva' },
            'input[data-testid="pct"]': { value: '34' },
            'textarea[data-testid="commentary"]': { value: 'commentaire' },
            'input[data-testid="file"]': {
              files: [goodFormatFile],
              addEventListener: () => true,
            }
          }
          return inputs[s] || { addEventListener: () => true }
        },
        getElementById: mockGetElementById
      }

      const mockUpdate = jest.fn();
      mockUpdate.mockResolvedValue({})

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
          querySelector: documentMock.querySelector
        }
      })

      const data = JSON.parse(mockUpdate.mock.calls[0][0].data);
      expect(data).toMatchObject({
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
      })
    })
  })

  describe("Integration test - POST new bill", () => {
    beforeEach(() => {
      jest.clearAllMocks()
      localStorage.setItem("user", JSON.stringify({ email: "test@oc.fr" }))
    })

    test("should post new bill and return success", async () => {
      const newBill = {
        id: "1234",
        email: "a@a",
        name: "encore",
        type: "Hôtel et logement",
        amount: 400,
        date: "2004-04-04",
        vat: "80",
        pct: 20,
        commentary: "séminaire billed",
        fileUrl: "https://...",
        fileName: "preview-facture.jpg",
        status: "pending"
      };

      const store = mockStore;
      const createdBill = await store.bills().create({ data: newBill });

      expect(createdBill).toEqual({
        fileUrl: "https://localhost:3456/images/test.jpg",
        key: "1234"
      });
    });

    test("should throw 500 error", async () => {
      mockStore.bills = () => ({
        update: () => Promise.reject(new Error("Erreur 500"))
      })

      await expect(
        mockStore.bills().update({ data: "fake", selector: "1" })
      ).rejects.toThrow("Erreur 500")
    })

    test("should throw 404 error", async () => {
      mockStore.bills = () => ({
        update: () => Promise.reject(new Error("Erreur 404"))
      })

      await expect(
        mockStore.bills().update({ data: "fake", selector: "1" })
      ).rejects.toThrow("Erreur 404")
    })
  })
})
