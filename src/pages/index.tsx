import { ChangeEventHandler, useState, forwardRef, useEffect } from "react";
import Head from "next/head";
import styles from "@/styles/Home.module.css";
import { GenerateIndictmentBody } from "./api/generateIndictment";
import {
  Button,
  ButtonToolbar,
  Form,
  Input,
  Message,
  useToaster,
  Footer,
  Modal,
} from "rsuite";
import { PrependParameters } from "rsuite/esm/@types/utils";
import { TypeAttributes } from "rsuite/esm/@types/common";
import * as ackeeTracker from "ackee-tracker";
import EXAMPLE from "../../example";

const Textarea = forwardRef((props) => (
  <Input rows={5} {...props} as="textarea" className={styles.textarea} />
));
const config = require('./config');

// Localization (can be further enhanced with a proper i18n solution)
const TEXTS = {
  CASE_DETAILS: "Case Details:",
  APPEAL: "Appeal:",
  GENERATE_INDICTMENT: "Generate Indictment",
  CLEAR_DATA: "Clear Data",
  // ... add other texts
OTHER_TEXT: "Other Text",
};



export default function Home() {
  const [fact, setFact] = useState("");
  const [appeal, setAppeal] = useState("");
  const [indictment, setIndictment] = useState("");
  const [loading, setLoading] = useState(false);
  const toaster = useToaster();
  const [ackeeServer, setAckeeServer] = useState("");
  const [ACKEE, setACKEE] = useState<ackeeTracker.AckeeInstance>();

  function Example() {
    return (
      <div className={styles.example}>
        <div className={styles["example-label"]}>For example</div>
        <div className={styles["example-container"]}>
          {EXAMPLE.map(({ type, fact, appeal }) => (
            <Button
              size="xs"
              key={type}
              onClick={() => setExample(fact, appeal)}
            >
              {type}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  useEffect(() => {
     // Set up ackeeTracker for analytics
    if (location.hostname === "") {
      const ackeeServer = "";
      setAckeeServer(ackeeServer);
      setACKEE(
        ackeeTracker.create(ackeeServer, {
          detailed: true,
          ignoreLocalhost: false,
        })
      );
    }
  }, []);

  const MyMessage = (content: string, type: TypeAttributes.Status) => {
    return (
      <Message showIcon type={type}>
        {content}
      </Message>
    );
  };

  const generateIndictment = async () => {
    ACKEE?.action("eb09d303-db45-40db-aefd-1183d951b2c0", {
      key: "Click",
      value: 1,
    });
    setLoading(true);
    if (!fact || !appeal) {
      toaster.push(MyMessage("请输入‘事实经过’和‘诉求’！", "warning"), {
        placement: "topCenter",
        duration: 2000,
      });
      setLoading(false);
      return;
    }

    setIndictment("");
    const body: GenerateIndictmentBody = {
      fact: fact,
      appeal: appeal,
    };
    const res = await fetch("/api/generateIndictment", {
      method: "post",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
    let error = "";
    if (res.ok) {
      try {
        const data = res.body;
        if (!data) return;
        const reader = data.getReader();
        const decoder = new TextDecoder();
        let chunkValues = "";
        while (true) {
          const { value, done } = await reader.read();
          const chunkValue = decoder.decode(value);
          chunkValues += chunkValue;
          setIndictment(chunkValues);
          if (done) break;
        }
      } catch (err) {
        error = "Error: " + err;
      }
    } else {
      error = "Error: " + res.statusText;
    }
    toaster.push(
      MyMessage(error || "Success", error ? "error" : "success"),
      {
        placement: "topCenter",
        duration: 2000,
      }
    );
    setLoading(false);
  };

  const cleanForm = () => {
    setFact("");
    setAppeal("");
  };

  const factChange: PrependParameters<
    ChangeEventHandler<HTMLInputElement>,
    [value: string]
  > = (value, e) => {
    setFact(value);
  };

  const appealChange: PrependParameters<
    ChangeEventHandler<HTMLInputElement>,
    [value: string]
  > = (value, e) => {
    setAppeal(value);
  };

  const setExample = (fact: string, appeal: string) => {
    setFact(fact);
    setAppeal(appeal);
  };

  const indictmentChange: PrependParameters<
    ChangeEventHandler<HTMLInputElement>,
    [value: string]
  > = (value, e) => {
    setIndictment(value);
  };

  return (
    <>
      <Head>
        <title>LegalEase AI</title>
        <meta name="description" content="LegalEaseAI" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        {ackeeServer && (
          <script
            async
            src={`${ackeeServer}/tracker.js`}
            data-ackee-server={ackeeServer}
            data-ackee-domain-id="7cff383e-2fdf-4191-94c1-58f4a0c2d7d7"
            data-ackee-opts='{ "detailed": true, "ignoreLocalhost": false }'
          ></script>
        )}
      </Head>
      <main className={styles.main}>
        <div className={styles.config}>
          <h1 className={styles.title}>LegalEase AI</h1>
          <Notices />
          <Form fluid className={styles.form}>
            <Form.Group controlId="textarea">
              <Form.ControlLabel>Case Details:</Form.ControlLabel>
              <Form.Control
                name="textarea"
                accepter={Textarea}
                value={fact}
              placeholder={`For example：${EXAMPLE[0].fact}`}
                onChange={factChange}
              />
            </Form.Group>
            <Form.Group controlId="textarea">
              <Form.ControlLabel>Appeal:</Form.ControlLabel>
              <Form.Control
                name="textarea"
                accepter={Textarea}
                value={appeal}
                placeholder={`For example:${EXAMPLE[0].appeal}`}
                onChange={appealChange}
              />
            </Form.Group>
            <Form.Group>
              <Example />
            </Form.Group>
            <Form.Group>
            <ButtonToolbar>
            <Button
              loading={loading}
              appearance="primary"
              onClick={generateIndictment}
            >
              {TEXTS.GENERATE_INDICTMENT}
            </Button>
            <Button appearance="default" onClick={cleanForm}>
              {TEXTS.CLEAR_DATA}
            </Button>
          </ButtonToolbar>
            </Form.Group>
            <Form.Group>
              <div className={styles.tips}>
                {
                  TEXTS.TIPS
                }
              </div>
            </Form.Group>
          </Form>
        </div>
        <div className={styles.output}>
          <Input
            as="textarea"
            placeholder="Indictment"
            value={indictment}
            onChange={indictmentChange}
          />
        </div>
        <Footer className={styles.footer}>
          {/* {"yuanx @ "} */}
          {/* <a href="https://github.com/imyuanx" target="_blank"> */}
            {/* GitHub */}
          {/* </a> */}
          {/* {" | "} */}
          {/* <a href="https://twitter.com/imyuanx" target="_blank"> */}
            {/* Twitter */}
          {/* </a> */}
        </Footer>
      </main>
    </>
  );
}
