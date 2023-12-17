import { defineStore } from 'pinia'
import getApi from '@/plugins/axios'

const api = getApi().api
const publicClient = getApi().publicClient


export const useCertificateStore = defineStore('certificate', {
  state: () => ({
    certificatesInfo: [],
    documentSignatures: [],
    CAPICOM_CURRENT_USER_STORE: 2,
    CAPICOM_MY_STORE: "My",
    CAPICOM_STORE_OPEN_MAXIMUM_ALLOWED: 2,
  }),

  getters: {

  },

  actions: {
    async getSertificates() {
      var oStore = await cadesplugin.CreateObjectAsync("CAdESCOM.Store");
      await oStore.Open(
        this.CAPICOM_CURRENT_USER_STORE,
        this.CAPICOM_MY_STORE,
        this.CAPICOM_STORE_OPEN_MAXIMUM_ALLOWED
      )

      var oStoreCerts = await oStore.Certificates;

      const certs = []
      for (let i = 1; i < await oStoreCerts.Count + 1; i++) {
        const itemI = await oStoreCerts.Item(i)
        const certName = await itemI.GetInfo(0)
        const thumbprint = await itemI.Thumbprint
        const endDate = await itemI.ValidToDate
        const cert = {
          name: certName,
          thumbprint: thumbprint,
          endDate: new Date(endDate).toLocaleString()
        }
        certs.push(cert)
      }

      this.certificatesInfo = certs
    },

    async createSignature(file, thumbprint) {
      try {
        // Инициализация хранилища сертификатов
        const oStore = await cadesplugin.CreateObjectAsync("CAdESCOM.Store");
        await oStore.Open(
          this.CAPICOM_CURRENT_USER_STORE,
          this.CAPICOM_MY_STORE,
          this.CAPICOM_STORE_OPEN_MAXIMUM_ALLOWED
        );

        // Поиск сертификата по отпечатку
        const oCertificates = await oStore.Certificates;
        const oFilteredCertificates = await oCertificates.Find(cadesplugin.CAPICOM_CERTIFICATE_FIND_SHA1_HASH, thumbprint);
        const count = await oFilteredCertificates.Count;
        if (count === 0) {
          throw new Error("Сертификат не найден");
        }
        const oCertificate = await oFilteredCertificates.Item(1);

        // Создание объекта для подписи
        const oSigner = await cadesplugin.CreateObjectAsync("CAdESCOM.CPSigner");
        await oSigner.propset_Certificate(oCertificate);
        const oSignedData = await cadesplugin.CreateObjectAsync("CAdESCOM.CadesSignedData");

        // Чтение файла
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
          reader.onload = async (e) => {
            try {
              const fileContent = e.target.result;
              const base64FileContent = btoa(fileContent); // Преобразование в Base64
              await oSignedData.propset_ContentEncoding(cadesplugin.CADESCOM_BASE64_TO_BINARY);
              await oSignedData.propset_Content(base64FileContent);

              // Подписание данных
              const signature = await oSignedData.SignCades(oSigner, cadesplugin.CADESCOM_CADES_BES, true);
              resolve(signature);
            } catch (err) {
              reject("Ошибка при создании подписи: " + cadesplugin.getLastError(err));
            }
          };

          reader.onerror = () => {
            reject("Ошибка чтения файла");
          };

          reader.readAsBinaryString(file);
        });
      } catch (err) {
        throw new Error("Ошибка при инициализации подписи: " + cadesplugin.getLastError(err));
      }
    },

    async getAllSignersInfo(signature, dataInBase64) {
      try {
        // Создание объекта CAdESCOM.CadesSignedData
        const oSignedData = await cadesplugin.CreateObjectAsync("CAdESCOM.CadesSignedData");

        // Проверка подписи
        await oSignedData.propset_ContentEncoding(1);//cadesplugin.CADESCOM_BASE64_TO_BINARY
        await oSignedData.propset_Content(dataInBase64);
        await oSignedData.VerifyCades(signature, cadesplugin.CADESCOM_CADES_BES, true);
        console.log('Верификация успешна')

        // Получение подписей
        const signers = await oSignedData.Signers;
        const count = await signers.Count;

        let signersInfo = {};

        const signer = await signers.Item(1);
        const certificate = await signer.Certificate;

        const subjectName = await certificate.SubjectName;
        const issuerName = await certificate.IssuerName;
        const validFrom = await certificate.ValidFromDate;
        const validTo = await certificate.ValidToDate;
        const serialNumber = await certificate.SerialNumber;

        const owner = await this.extractDataFromDistinguishedName(subjectName, "CN");
        const issuer = await this.extractDataFromDistinguishedName(issuerName, "CN");

        signersInfo = {
          owner, // Имя владельца сертификата
          issuer, // Издатель сертификата
          validFrom, // Начало срока действия
          validTo, // Окончание срока действия
          serialNumber // Уникальный идентификатор
        };
        
        return signersInfo

      } catch (error) {
        console.error("Ошибка при получении информации о сертификате:", error);
        throw error;
      }
    },

    async extractDataFromDistinguishedName(dn, key) {
      const re = new RegExp(`${key}=([^,]+)`);
      const matches = dn.match(re);
      return matches && matches[1] ? matches[1] : null;
    },
    async blobToBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
          // Получаем только часть с данными Base64
          const fileContent = e.target.result;
          const base64FileContent = btoa(fileContent);
          resolve(base64FileContent);
        };
        reader.onerror = reject;
        reader.readAsBinaryString(file);
      });
    },

    async sendSignatureToServer(docId, requestBody, options) {
      const url = `http://127.0.0.1:8000/edi/documents/${docId}/signatures/`
      const response = await api.post(url, requestBody, options)
      return response
    },

    async downloadSignature(url) {
      try {
        const response = await api.get(url, { responseType: 'blob' });
        return response.data; // Возвращаем файл как Blob
      } catch (error) {
        console.error('Ошибка при загрузке файла:', error);
        throw error;
      }
    }
  }
})