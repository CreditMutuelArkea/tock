
# Liste des fournisseurs de base vectorielle pris en compte par Tock.


<table>
<tr>
<td>

**Fournisseur de base vectorielle**
</td>
<td> 

**Configuration**
</td>
</tr>
<tr>
<td style="text-align: center;">

`OpenSearch` <br />
[Docs](https://opensearch.org/docs/latest/)
</td>
<td>

```json
{
  "provider": "OpenSearch",
  "k": 3,
  "filter": [
    {
      "term": {
        "metadata.index_session_id.keyword": "08738666-68d7-45fd-b13b-786ea33b0218"
      }
    }
  ]
}
```
</td>
</tr>
</table>