export default {
  bills() {
    const baseUrl = "http://localhost:5678"; // assure-toi que ton backend tourne ici

    return {
      list: () =>
        fetch(`${baseUrl}/bills`)
          .then((res) => {
            if (!res.ok) throw new Error('Failed to fetch bills');
            return res.json();
          }),

      create: (bill) =>
        fetch(`${baseUrl}/bills`, {
          method: 'POST',
          body: bill.data,
          headers: bill.headers,
        }).then((res) => {
          if (!res.ok) throw new Error('Failed to create bill');
          return res.json();
        }),

      update: (bill) =>
        fetch(`${baseUrl}/bills/${bill.selector}`, {
          method: 'PUT',
          body: bill.data,
          headers: {
            'Content-Type': 'application/json',
          },
        }).then((res) => {
          if (!res.ok) throw new Error('Failed to update bill');
          return res.json();
        }),
    };
  },
};
